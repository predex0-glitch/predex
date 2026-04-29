import { Chamado } from "@/types/chamado";
import { supabase } from "@/lib/supabase";

type NovoChamado = Pick<Chamado, "nome" | "apartamento" | "mensagem">;

export async function listarChamados(): Promise<Chamado[]> {
  const { data, error } = await supabase
    .from("chamados")
    .select("id, nome, apartamento, mensagem, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao listar chamados: ${error.message}`);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    apartamento: item.apartamento,
    mensagem: item.mensagem,
    status: item.status,
    criadoEm: item.created_at,
  }));
}

export async function criarChamado(dados: NovoChamado): Promise<Chamado> {
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

  return {
    id: data.id,
    nome: data.nome,
    apartamento: data.apartamento,
    mensagem: data.mensagem,
    status: data.status,
    criadoEm: data.created_at,
  };
}
