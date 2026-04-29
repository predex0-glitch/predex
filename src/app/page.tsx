"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="card">
        <h1>Como você deseja entrar?</h1>
        <p className="subtitle">Escolha uma opção para continuar.</p>

        <div className="opcoesAcesso">
          <Link href="/morador" className="opcaoCard">
            <h2>Sou morador</h2>
            <p>Informar código do condomínio e abrir chamado.</p>
          </Link>

          <Link href="/sindico" className="opcaoCard">
            <h2>Sou síndico</h2>
            <p>Criar prédio/condomínio e gerar código automaticamente.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
