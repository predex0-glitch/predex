import { Chamado } from "@/types/chamado";
import { getSupabase } from "@/lib/supabase";

type NovoChamado = Pick<Chamado, "nome" | "apartamento" | "mensagem">;
type ChamadoRow = {
  id: string;
  nome: string;
  apartamento: string;
  mensagem: string;
  status: Chamado["status"];
  created_at: string;
};

export async function listarChamados(): Promise<Chamado[]> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;

  const { data, error } = await supabase
    .from("chamados")
    .select("id, nome, apartamento, mensagem, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar chamados: ${error.message}`);
  }

  return ((data ?? []) as ChamadoRow[]).map((item) => ({
    id: item.id,
    nome: item.nome,
    apartamento: item.apartamento,
    mensagem: item.mensagem,
    status: item.status,
    criadoEm: item.created_at,
  }));
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
      mensagem: dados.mensagem.trim(),
      status: "aberto",
    })
    .select("id, nome, apartamento, mensagem, status, created_at")
    .single();

  if (error) {
    throw new Error(`Erro ao criar chamado: ${error.message}`);
  }

  const item = data as ChamadoRow;

  return {
    id: item.id,
    nome: item.nome,
    apartamento: item.apartamento,
    mensagem: item.mensagem,
    status: item.status,
    criadoEm: item.created_at,
  };
}
