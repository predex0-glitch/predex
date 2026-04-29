"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Chamado } from "@/types/chamado";

type EstadoPainel = "idle" | "carregando" | "sucesso" | "erro";
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

function formatarStatus(status: string): string {
  if (status === "em_andamento") return "Em andamento";
  if (status === "resolvido") return "Resolvido";
  return "Aberto";
}

function statusClass(status: string): string {
  if (status === "em_andamento") return "statusBadge andamento";
  if (status === "resolvido") return "statusBadge resolvido";
  return "statusBadge aberto";
}

export default function PainelPage() {
  const [sindicoSalvo, setSindicoSalvo] = useState<SindicoSalvo | null>(
    carregarSindicoSalvo,
  );
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [estado, setEstado] = useState<EstadoPainel>(() =>
    carregarSindicoSalvo() ? "carregando" : "idle",
  );
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!sindicoSalvo) {
      return;
    }

    const codigoCondominio = sindicoSalvo.codigoCondominio;
    let ativo = true;

    async function carregarChamados() {
      setEstado("carregando");
      setFeedback("");

      try {
        const response = await fetch(
          `/api/chamados?codigo=${encodeURIComponent(codigoCondominio)}`,
        );
        const data = await response.json();

        if (!ativo) {
          return;
        }

        if (!response.ok) {
          setEstado("erro");
          setFeedback(data?.erro ?? "Falha ao carregar chamados.");
          return;
        }

        setChamados(data);
        setEstado("sucesso");
      } catch {
        if (!ativo) {
          return;
        }

        setEstado("erro");
        setFeedback("Erro de conexão ao carregar chamados.");
      }
    }

    void carregarChamados();

    return () => {
      ativo = false;
    };
  }, [sindicoSalvo]);

  function limparAcesso() {
    window.localStorage.removeItem(STORAGE_KEY);
    setSindicoSalvo(null);
    setChamados([]);
    setEstado("idle");
    setFeedback("");
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Painel de Chamados</h1>

        {!sindicoSalvo ? (
          <>
            <p className="subtitle">
              Este painel só abre no dispositivo do síndico que criou o condomínio.
            </p>
            <p className="vazio">
              Cadastre ou reabra o condomínio pela área do síndico para ver os chamados
              do seu prédio.
            </p>
            <Link href="/sindico" className="botaoPrimarioLink">
              Ir para área do síndico
            </Link>
          </>
        ) : (
          <>
            <div className="residenteResumo">
              <h2>{sindicoSalvo.nomeCondominio}</h2>
              <p>
                <strong>Código do condomínio:</strong> {sindicoSalvo.codigoCondominio}
              </p>

              <div className="acoesResumo">
                <button type="button" className="botaoSecundario" onClick={limparAcesso}>
                  Remover deste dispositivo
                </button>
              </div>
            </div>

            {estado === "carregando" ? (
              <p className="vazio">Carregando chamados do condomínio...</p>
            ) : null}

            {feedback ? (
              <p className={estado === "erro" ? "feedback erro" : "feedback sucesso"}>
                {feedback}
              </p>
            ) : null}

            {estado !== "carregando" && chamados.length === 0 ? (
              <p className="vazio">Nenhum chamado registrado para este condomínio.</p>
            ) : null}

            {chamados.length > 0 ? (
              <ul className="listaChamados">
                {chamados.map((chamado) => (
                  <li key={chamado.id}>
                    <h2>{chamado.nome}</h2>
                    <p>
                      <strong>Apartamento:</strong> {chamado.apartamento}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={statusClass(chamado.status)}>
                        {formatarStatus(chamado.status)}
                      </span>
                    </p>
                    <p>{chamado.mensagem}</p>
                    <small>{new Date(chamado.criadoEm).toLocaleString("pt-BR")}</small>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}

        <Link href="/" className="linkPainel">
          Voltar para seleção de perfil
        </Link>
      </section>
    </main>
  );
}
