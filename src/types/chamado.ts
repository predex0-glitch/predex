export type Chamado = {
  id: string;
  codigoCondominio: string;
  nome: string;
  apartamento: string;
  mensagem: string;
  status: "aberto" | "em_andamento" | "resolvido";
  criadoEm: string;
};
