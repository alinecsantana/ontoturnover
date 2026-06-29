// ============================================================
// Estrutura organizacional — setores e cargos
// ------------------------------------------------------------
// Estes valores alimentam os seletores de permissão ao criar
// um conhecimento. Os valores reais de cada usuário vêm do
// Microsoft Entra ID (campos `department` e `jobTitle`), então
// a lista abaixo serve como sugestão — qualquer setor/cargo
// retornado pelo Azure AD também é aceito.
// ============================================================

export const SETORES = [
  "Diretoria",
  "Recursos Humanos",
  "Financeiro",
  "Comercial",
  "Marketing",
  "Tecnologia",
  "Operações",
  "Jurídico",
  "Atendimento",
] as const;

export const CARGOS = [
  "Diretor(a)",
  "Gerente",
  "Coordenador(a)",
  "Especialista",
  "Analista",
  "Assistente",
  "Estagiário(a)",
] as const;

export type Escopo = "privado" | "restrito" | "organizacao";

export const ESCOPOS: { value: Escopo; label: string; descricao: string }[] = [
  {
    value: "privado",
    label: "Privado",
    descricao: "Somente você tem acesso a este conhecimento.",
  },
  {
    value: "restrito",
    label: "Restrito por setor/cargo",
    descricao: "Visível apenas para os setores e cargos que você liberar.",
  },
  {
    value: "organizacao",
    label: "Toda a organização",
    descricao: "Visível para todos os usuários autenticados da empresa.",
  },
];

export const ESCOPO_LABEL: Record<Escopo, string> = {
  privado: "Privado",
  restrito: "Restrito",
  organizacao: "Organização",
};
