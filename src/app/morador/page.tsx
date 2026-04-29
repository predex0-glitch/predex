"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type EstadoEnvio = "idle" | "enviando" | "sucesso" | "erro";
type EstadoAcesso = "idle" | "validando" | "sucesso" | "erro";
type MoradorSalvo = {
  codigoCondominio: string;
  nomeCondominio: string;
  nome: string;
  apartamento: string;
};

const STORAGE_KEY = "predex-morador";

function carregarMoradorSalvo(): MoradorSalvo | null {
  if (typeof window === "undefined") {
    return null;
  }

  const salvo = window.localStorage.getItem(STORAGE_KEY);

  if (!salvo) {
    return null;
  }

  try {
    return JSON.parse(salvo) as MoradorSalvo;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export default function MoradorPage() {
  const [moradorSalvo, setMoradorSalvo] = useState<MoradorSalvo | null>(carregarMoradorSalvo);
  const [codigoCondominio, setCodigoCondominio] = useState(
    () => carregarMoradorSalvo()?.codigoCondominio ?? "",
  );
  const [nome, setNome] = useState(() => carregarMoradorSalvo()?.nome ?? "");
  const [apartamento, setApartamento] = useState(
    () => carregarMoradorSalvo()?.apartamento ?? "",
  );
  const [mensagem, setMensagem] = useState("");
  const [estado, setEstado] = useState<EstadoEnvio>("idle");
  const [estadoAcesso, setEstadoAcesso] = useState<EstadoAcesso>(
    () => (carregarMoradorSalvo() ? "sucesso" : "idle"),
  );
  const [feedback, setFeedback] = useState("");
  const [feedbackAcesso, setFeedbackAcesso] = useState("");

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstadoAcesso("validando");
    setFeedbackAcesso("");

    try {
      const response = await fetch(
        `/api/condominios?codigo=${encodeURIComponent(
          codigoCondominio.trim().toUpperCase(),
        )}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setEstadoAcesso("erro");
        setFeedbackAcesso(data?.erro ?? "Não foi possível validar o condomínio.");
        return;
      }

      const morador = {
        codigoCondominio: data.codigo,
        nomeCondominio: data.nome,
        nome: nome.trim(),
        apartamento: apartamento.trim(),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(morador));
      setMoradorSalvo(morador);
      setCodigoCondominio(morador.codigoCondominio);
      setNome(morador.nome);
      setApartamento(morador.apartamento);
      setEstadoAcesso("sucesso");
      setFeedbackAcesso(`Entrada confirmada em ${morador.nomeCondominio}.`);
    } catch {
      setEstadoAcesso("erro");
      setFeedbackAcesso("Erro de conexão ao validar o condomínio.");
    }
  }

  function sair() {
    window.localStorage.removeItem(STORAGE_KEY);
    setMoradorSalvo(null);
    setCodigoCondominio("");
    setNome("");
    setApartamento("");
    setMensagem("");
    setEstado("idle");
    setEstadoAcesso("idle");
    setFeedback("");
    setFeedbackAcesso("");
  }

  async function enviarChamado(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setFeedback("");

    const mensagemCompleta = `[Código do condomínio: ${codigoCondominio.trim().toUpperCase()}] ${mensagem}`;

    try {
      const response = await fetch("/api/chamados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, apartamento, mensagem: mensagemCompleta }),
      });

      const data = await response.json();
      if (!response.ok) {
        setEstado("erro");
        setFeedback(data?.erro ?? "Falha ao registrar chamado.");
        return;
      }

      setEstado("sucesso");
      setFeedback("Chamado registrado com sucesso.");
      setMensagem("");
    } catch {
      setEstado("erro");
      setFeedback("Erro de conexão ao enviar chamado.");
    }
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Área do morador</h1>
        <p className="subtitle">
          Primeiro identifique seu condomínio. Depois, o dispositivo guarda seus dados
          para os próximos chamados.
        </p>

        {moradorSalvo ? (
          <>
            <div className="residenteResumo">
              <h2>Identificação salva neste dispositivo</h2>
              <p>
                <strong>Condomínio:</strong> {moradorSalvo.nomeCondominio} (
                {moradorSalvo.codigoCondominio})
              </p>
              <p>
                <strong>Morador:</strong> {moradorSalvo.nome}
              </p>
              <p>
                <strong>Apartamento:</strong> {moradorSalvo.apartamento}
              </p>
              <button type="button" className="botaoSecundario" onClick={sair}>
                Trocar dados salvos
              </button>
            </div>

            <form onSubmit={enviarChamado} className="formulario">
              <label htmlFor="mensagem">Mensagem</label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(event) => setMensagem(event.target.value)}
                rows={4}
                required
              />

              <button type="submit" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando..." : "Abrir chamado"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={entrar} className="formulario">
            <label htmlFor="codigoCondominio">Código do condomínio</label>
            <input
              id="codigoCondominio"
              value={codigoCondominio}
              onChange={(event) => setCodigoCondominio(event.target.value.toUpperCase())}
              maxLength={6}
              required
            />

            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />

            <label htmlFor="apartamento">Apartamento</label>
            <input
              id="apartamento"
              value={apartamento}
              onChange={(event) => setApartamento(event.target.value)}
              required
            />

            <button type="submit" disabled={estadoAcesso === "validando"}>
              {estadoAcesso === "validando" ? "Entrando..." : "Entrar como morador"}
            </button>
          </form>
        )}

        {feedbackAcesso ? (
          <p className={estadoAcesso === "erro" ? "feedback erro" : "feedback sucesso"}>
            {feedbackAcesso}
          </p>
        ) : null}

        {feedback ? (
          <p className={estado === "erro" ? "feedback erro" : "feedback sucesso"}>
            {feedback}
          </p>
        ) : null}

        <Link href="/" className="linkPainel">
          Voltar para escolha de perfil
        </Link>
        <Link href="/painel" className="linkPainel">
          Ver painel de chamados
        </Link>
      </section>
    </main>
  );
}
