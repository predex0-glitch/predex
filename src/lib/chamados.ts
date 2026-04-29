import { Chamado } from "@/types/chamado";
import { getSupabase } from "@/lib/supabase";

type NovoChamado = Pick<
  Chamado,
  "codigoCondominio" | "nome" | "apartamento" | "mensagem"
>;
type ChamadoRow = {
  id: string;
  nome: string;
  apartamento: string;
  mensagem: string;
  status: Chamado["status"];
  created_at: string;
};
const CODIGO_PREFIXO = "[Código do condomínio: ";

function normalizarCodigoCondominio(codigo: string): string {
  return codigo.trim().toUpperCase();
}

function montarMensagemArmazenada(
  codigoCondominio: string,
  mensagem: string,
): string {
  return `${CODIGO_PREFIXO}${normalizarCodigoCondominio(codigoCondominio)}] ${mensagem.trim()}`;
}

function extrairCodigoDaMensagem(mensagem: string): string {
  const match = mensagem.match(/^\[Código do condomínio: ([A-Z0-9]{6})\]/);
  return match?.[1] ?? "";
}

function limparMensagemDoCodigo(mensagem: string): string {
  return mensagem.replace(/^\[Código do condomínio: [A-Z0-9]{6}\]\s*/, "");
}

function mapearChamado(item: ChamadoRow): Chamado {
  return {
    id: item.id,
    codigoCondominio: extrairCodigoDaMensagem(item.mensagem),
    nome: item.nome,
    apartamento: item.apartamento,
    mensagem: limparMensagemDoCodigo(item.mensagem),
    status: item.status,
    criadoEm: item.created_at,
  };
}

export async function listarChamadosPorCodigo(
  codigoCondominio: string,
): Promise<Chamado[]> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;
  const codigoNormalizado = normalizarCodigoCondominio(codigoCondominio);

  const { data, error } = await supabase
    .from("chamados")
    .select("id, nome, apartamento, mensagem, status, created_at")
    .like("mensagem", `${CODIGO_PREFIXO}${codigoNormalizado}]%`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar chamados: ${error.message}`);
  }

  return ((data ?? []) as ChamadoRow[]).map(mapearChamado);
}

export async function criarChamado(dados: NovoChamado): Promise<Chamado> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;

  const { data, error } = await supabase
    .from("chamados")
    .insert({
      nome: dados.nome.trim(),
      apartamento: dados.apartamento.trim(),
      mensagem: montarMensagemArmazenada(dados.codigoCondominio, dados.mensagem),
      status: "aberto",
    })
    .select("id, nome, apartamento, mensagem, status, created_at")
    .single();

  if (error) {
    throw new Error(`Erro ao criar chamado: ${error.message}`);
  }

  const item = data as ChamadoRow;

  return mapearChamado(item);
}
