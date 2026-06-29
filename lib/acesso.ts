import { auth } from "@/lib/auth";
import { upsertUsuario, type ContextoAcesso } from "@/lib/db";

export type SessaoAtual = ContextoAcesso & {
  email: string;
  nome: string;
  foto?: string | null;
};

/**
 * Resolve a sessão atual, garante que o usuário exista no banco
 * (com setor e cargo vindos do Microsoft Entra ID) e devolve o
 * contexto de acesso usado em todas as consultas ao cérebro.
 *
 * Retorna null quando não há sessão autenticada.
 */
export async function sessaoAtual(): Promise<SessaoAtual | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const usuarioId = session.user.id ?? session.user.email;
  const setor = session.user.department ?? null;
  const cargo = session.user.jobTitle ?? null;

  upsertUsuario({
    id: usuarioId,
    email: session.user.email,
    nome: session.user.name ?? session.user.email,
    setor,
    cargo,
    foto_url: session.user.image,
  });

  return {
    usuarioId,
    setor,
    cargo,
    email: session.user.email,
    nome: session.user.name ?? session.user.email,
    foto: session.user.image,
  };
}
