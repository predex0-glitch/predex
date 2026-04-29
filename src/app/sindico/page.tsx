"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type EstadoCriacao = "idle" | "enviando" | "sucesso" | "erro";
type SindicoSalvo = {
  codigoCondominio: string;
  nomeCondominio: string;
};

const STORAGE_KEY = "predex-sindico";

function carregarSindicoSalvo(): SindicoSalvo | null {
  if (typeof window === "undefined") {
    return null;
  }

  const salvo = window.localStorage.getItem(STORAGE_KEY);

  if (!salvo) {
    return null;
  }

  try {
    return JSON.parse(salvo) as SindicoSalvo;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export default function SindicoPage() {
  const [nomeCondominio, setNomeCondominio] = useState("");
  const [estado, setEstado] = useState<EstadoCriacao>("idle");
  const [feedback, setFeedback] = useState("");
  const [sindicoSalvo, setSindicoSalvo] = useState<SindicoSalvo | null>(
    carregarSindicoSalvo,
  );

  async function criar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setFeedback("");

    try {
      const response = await fetch("/api/condominios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: nomeCondominio }),
      });

      const data = await response.json();
      if (!response.ok) {
        setEstado("erro");
        setFeedback(data?.erro ?? "Falha ao criar condomínio.");
        return;
      }

      const acesso = {
        codigoCondominio: data.codigo,
        nomeCondominio: data.nome,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(acesso));
      setSindicoSalvo(acesso);
      setEstado("sucesso");
      setNomeCondominio("");
      setFeedback(
        `Condomínio criado com sucesso. Compartilhe o código ${data.codigo} com os moradores.`,
      );
    } catch {
      setEstado("erro");
      setFeedback("Erro de conexão ao criar condomínio.");
    }
  }

  function limparAcesso() {
    window.localStorage.removeItem(STORAGE_KEY);
    setSindicoSalvo(null);
    setNomeCondominio("");
    setEstado("idle");
    setFeedback("");
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Área do síndico</h1>
        <p className="subtitle">
          Cadastre o nome do prédio/condomínio. O código gerado fica salvo neste
          dispositivo e os moradores usam esse código para entrar.
        </p>

        {sindicoSalvo ? (
          <div className="residenteResumo">
            <h2>Condomínio salvo neste dispositivo</h2>
            <p>
              <strong>Condomínio:</strong> {sindicoSalvo.nomeCondominio}
            </p>
            <p>
              <strong>Código de acesso dos moradores:</strong>
            </p>
            <p className="codigoDestaque">{sindicoSalvo.codigoCondominio}</p>

            <div className="acoesResumo">
              <Link href="/painel" className="botaoPrimarioLink">
                Ver chamados do condomínio
              </Link>
              <button type="button" className="botaoSecundario" onClick={limparAcesso}>
                Criar outro condomínio
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={criar} className="formulario">
            <label htmlFor="nomeCondominio">Nome do prédio/condomínio</label>
            <input
              id="nomeCondominio"
              value={nomeCondominio}
              onChange={(event) => setNomeCondominio(event.target.value)}
              required
            />

            <button type="submit" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Criando..." : "Criar condomínio"}
            </button>
          </form>
        )}

        {feedback ? (
          <p className={estado === "erro" ? "feedback erro" : "feedback sucesso"}>
            {feedback}
          </p>
        ) : null}

        <Link href="/" className="linkPainel">
          Voltar para início
        </Link>
      </section>
    </main>
  );
}
