import { NextResponse } from "next/server";

import { criarChamado, listarChamados } from "@/lib/chamados";

export async function GET() {
  try {
    const chamados = await listarChamados();
    return NextResponse.json(chamados);
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao listar chamados." },
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
  const apartamento = String(body?.apartamento ?? "").trim();
  const mensagem = String(body?.mensagem ?? "").trim();

  if (!nome || !apartamento || !mensagem) {
    return NextResponse.json(
      { erro: "Preencha nome, apartamento e mensagem." },
      { status: 400 },
    );
  }

  try {
    const chamado = await criarChamado({ nome, apartamento, mensagem });
    return NextResponse.json(chamado, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao criar chamado." },
      { status: 500 },
    );
  }
}
