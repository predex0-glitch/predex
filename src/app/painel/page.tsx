import Link from "next/link";

import { listarChamados } from "@/lib/chamados";

export const dynamic = "force-dynamic";

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

export default async function PainelPage() {
  const chamados = await listarChamados();

  return (
    <main className="container">
      <section className="card">
        <h1>Painel de Chamados</h1>
        <p className="subtitle">Lista de solicitações abertas pelos moradores.</p>

        {chamados.length === 0 ? (
          <p className="vazio">Nenhum chamado registrado até o momento.</p>
        ) : (
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
                <small>
                  {new Date(chamado.criadoEm).toLocaleString("pt-BR")}
                </small>
              </li>
            ))}
          </ul>
        )}

        <Link href="/" className="linkPainel">
          Voltar para seleção de perfil
        </Link>
      </section>
    </main>
  );
}
