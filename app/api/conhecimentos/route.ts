import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { criarConhecimento, listarConhecimentos, upsertUsuario } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const userId = session.user.id ?? session.user.email;
  const busca = request.nextUrl.searchParams.get("q") ?? undefined;
  const conhecimentos = listarConhecimentos(userId, busca);
  return NextResponse.json(
    conhecimentos.map((k) => ({ ...k, tags: JSON.parse(k.tags || "[]") }))
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const userId = session.user.id ?? session.user.email;

  upsertUsuario({
    id: userId,
    email: session.user.email,
    nome: session.user.name ?? session.user.email,
    departamento: session.user.department,
    cargo: session.user.jobTitle,
    foto_url: session.user.image,
  });

  const body = await request.json();
  const { titulo, conteudo, tags, fonte_ia, publico } = body;

  if (!titulo || !conteudo) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
  }

  const id = criarConhecimento({
    usuario_id: userId,
    titulo,
    conteudo,
    tags,
    fonte_ia,
    publico,
  });

  return NextResponse.json({ id }, { status: 201 });
}
