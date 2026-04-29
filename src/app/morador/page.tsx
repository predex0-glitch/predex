"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type EstadoEnvio = "idle" | "enviando" | "sucesso" | "erro";

export default function MoradorPage() {
  const [codigoCondominio, setCodigoCondominio] = useState("");
  const [nome, setNome] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [estado, setEstado] = useState<EstadoEnvio>("idle");
  const [feedback, setFeedback] = useState("");

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
      setCodigoCondominio("");
      setNome("");
      setApartamento("");
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
        <p className="subtitle">Informe o código do condomínio e os dados do chamado.</p>

        <form onSubmit={enviarChamado} className="formulario">
          <label htmlFor="codigoCondominio">Código do condomínio</label>
          <input
            id="codigoCondominio"
            value={codigoCondominio}
            onChange={(event) => setCodigoCondominio(event.target.value)}
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
