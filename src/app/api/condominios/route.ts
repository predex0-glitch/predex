import { NextResponse } from "next/server";

import { criarCondominio } from "@/lib/condominios";
import { getSupabase } from "@/lib/supabase";

function extrairBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

export async function POST(request: Request) {
  // O client está sem schema tipado por enquanto.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any;
  try {
    supabase = getSupabase();
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Supabase não configurado.",
      },
      { status: 500 },
    );
  }

  const token = extrairBearerToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { erro: "Usuário não autenticado. Envie o token Bearer." },
      { status: 401 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { erro: "Token inválido ou expirado." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { erro: "JSON inválido na requisição." },
      { status: 400 },
    );
  }

  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json(
      { erro: "Preencha o nome do condomínio." },
      { status: 400 },
    );
  }

  try {
    const condominio = await criarCondominio(nome, user.id);
    return NextResponse.json(condominio, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao criar condomínio.",
      },
      { status: 500 },
    );
  }
}
