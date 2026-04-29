import { randomInt } from "crypto";

import { getSupabase } from "@/lib/supabase";
import { Condominio } from "@/types/condominio";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 10;
type CondominioRow = {
  id: string;
  nome: string;
  codigo: string;
  user_id: string;
  created_at: string;
};

function gerarCodigoCondominio(): string {
  let codigo = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const index = randomInt(0, CHARS.length);
    codigo += CHARS[index];
  }

  return codigo;
}

export async function criarCondominio(
  nome: string,
  userId: string,
): Promise<Condominio> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;

  for (let tentativa = 0; tentativa < MAX_ATTEMPTS; tentativa += 1) {
    const codigo = gerarCodigoCondominio();

    const { data, error } = await supabase
      .from("condominios")
      .insert({
        nome: nome.trim(),
        codigo,
        user_id: userId,
      })
      .select("id, nome, codigo, user_id, created_at")
      .single();

    if (!error && data) {
      const item = data as CondominioRow;

      return {
        id: item.id,
        nome: item.nome,
        codigo: item.codigo,
        userId: item.user_id,
        createdAt: item.created_at,
      };
    }

    if (error?.code === "23505") {
      continue;
    }

    throw new Error(`Erro ao criar condominio: ${error?.message ?? "desconhecido"}`);
  }

  throw new Error("Nao foi possivel gerar um codigo unico para o condominio.");
}
