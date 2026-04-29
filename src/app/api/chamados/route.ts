import { NextResponse } from "next/server";

import { criarChamado, listarChamadosPorCodigo } from "@/lib/chamados";
import { buscarCondominioPorCodigo } from "@/lib/condominios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigoCondominio = searchParams.get("codigo")?.trim().toUpperCase() ?? "";

  if (!codigoCondominio) {
    return NextResponse.json(
      { erro: "Informe o código do condomínio." },
      { status: 400 },
    );
  }

  try {
    const chamados = await listarChamadosPorCodigo(codigoCondominio);
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
  const codigoCondominio = String(body?.codigoCondominio ?? "")
    .trim()
    .toUpperCase();
  const mensagem = String(body?.mensagem ?? "").trim();

  if (!codigoCondominio || !nome || !apartamento || !mensagem) {
    return NextResponse.json(
      { erro: "Preencha código do condomínio, nome, apartamento e mensagem." },
      { status: 400 },
    );
  }

  try {
    const condominio = await buscarCondominioPorCodigo(codigoCondominio);

    if (!condominio) {
      return NextResponse.json(
        { erro: "Código de condomínio não encontrado." },
        { status: 404 },
      );
    }

    const chamado = await criarChamado({
      codigoCondominio,
      nome,
      apartamento,
      mensagem,
    });
    return NextResponse.json(chamado, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao criar chamado." },
      { status: 500 },
    );
  }
}
