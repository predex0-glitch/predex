import { NextResponse } from "next/server";

import { buscarCondominioPorCodigo, criarCondominio } from "@/lib/condominios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo")?.trim().toUpperCase() ?? "";

  if (!codigo) {
    return NextResponse.json(
      { erro: "Informe o código do condomínio." },
      { status: 400 },
    );
  }

  try {
    const condominio = await buscarCondominioPorCodigo(codigo);

    if (!condominio) {
      return NextResponse.json(
        { erro: "Código de condomínio não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: condominio.id,
      nome: condominio.nome,
      codigo: condominio.codigo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Erro ao buscar condomínio.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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
    const condominio = await criarCondominio(nome);
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
