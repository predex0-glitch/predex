import { randomInt, randomUUID } from "crypto";

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

async function criarUsuarioTecnicoCondominio(): Promise<string> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;
  const email = `condominio-${randomUUID()}@predex.local`;
  const password = `${randomUUID()}-${randomUUID()}`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      origem: "predex-condominio",
    },
  });

  if (error || !data?.user) {
    throw new Error(
      `Erro ao preparar acesso interno do condomínio: ${error?.message ?? "desconhecido"}`,
    );
  }

  return data.user.id;
}

export async function criarCondominio(nome: string): Promise<Condominio> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;
  const userId = await criarUsuarioTecnicoCondominio();

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

export async function buscarCondominioPorCodigo(
  codigo: string,
): Promise<Condominio | null> {
  // Supabase sem schema tipado retorna tabelas como `never` no build.
  // Este cast é intencional até adicionarmos tipos gerados do banco.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabase() as any;

  const codigoNormalizado = codigo.trim().toUpperCase();

  const { data, error } = await supabase
    .from("condominios")
    .select("id, nome, codigo, user_id, created_at")
    .eq("codigo", codigoNormalizado)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar condominio: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const item = data as CondominioRow;

  return {
    id: item.id,
    nome: item.nome,
    codigo: item.codigo,
    userId: item.user_id,
    createdAt: item.created_at,
  };
}
