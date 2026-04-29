import { randomInt } from "crypto";

import { supabase } from "@/lib/supabase";
import { Condominio } from "@/types/condominio";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 10;

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
      return {
        id: data.id,
        nome: data.nome,
        codigo: data.codigo,
        userId: data.user_id,
        createdAt: data.created_at,
      };
    }

    if (error?.code === "23505") {
      continue;
    }

    throw new Error(`Erro ao criar condominio: ${error?.message ?? "desconhecido"}`);
  }

  throw new Error("Nao foi possivel gerar um codigo unico para o condominio.");
}
