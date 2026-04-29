"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase-browser";

type EstadoCriacao = "idle" | "enviando" | "sucesso" | "erro";

export default function SindicoPage() {
  const [nomeCondominio, setNomeCondominio] = useState("");
  const [estado, setEstado] = useState<EstadoCriacao>("idle");
  const [feedback, setFeedback] = useState("");

  async function criar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setFeedback("");

    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session?.access_token) {
      setEstado("erro");
      setFeedback("Faça login para criar um condomínio.");
      return;
    }

    try {
      const response = await fetch("/api/condominios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ nome: nomeCondominio }),
      });

      const data = await response.json();
      if (!response.ok) {
        setEstado("erro");
        setFeedback(data?.erro ?? "Falha ao criar condomínio.");
        return;
      }

      setEstado("sucesso");
      setNomeCondominio("");
      setFeedback(`Condomínio criado com sucesso. Código: ${data.codigo}`);
    } catch {
      setEstado("erro");
      setFeedback("Erro de conexão ao criar condomínio.");
    }
  }

  return (
    <main className="container">
      <section className="card">
        <h1>Criar condomínio (Síndico)</h1>
        <p className="subtitle">
          Informe o nome do condomínio. O código único será gerado automaticamente.
        </p>

        <form onSubmit={criar} className="formulario">
          <label htmlFor="nomeCondominio">Nome do condomínio</label>
          <input
            id="nomeCondominio"
            value={nomeCondominio}
            onChange={(event) => setNomeCondominio(event.target.value)}
            required
          />

          <button type="submit" disabled={estado === "enviando"}>
            {estado === "enviando" ? "Criando..." : "Criar"}
          </button>
        </form>

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
