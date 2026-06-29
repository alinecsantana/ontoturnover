import { NextRequest, NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/acesso";
import { criarConhecimento, listarConhecimentos } from "@/lib/db";

export async function GET(request: NextRequest) {
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const busca = request.nextUrl.searchParams.get("q") ?? undefined;
  const conhecimentos = listarConhecimentos(ctx, busca);
  return NextResponse.json(
    conhecimentos.map((k) => ({
      ...k,
      tags: JSON.parse(k.tags || "[]"),
      setores_permitidos: JSON.parse(k.setores_permitidos || "[]"),
      cargos_permitidos: JSON.parse(k.cargos_permitidos || "[]"),
    }))
  );
}

export async function POST(request: NextRequest) {
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { titulo, conteudo, tags, fonte_ia, escopo, setores_permitidos, cargos_permitidos } = body;

  if (!titulo || !conteudo) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
  }

  const id = criarConhecimento({
    usuario_id: ctx.usuarioId,
    titulo,
    conteudo,
    tags,
    fonte_ia,
    escopo,
    setores_permitidos,
    cargos_permitidos,
  });

  return NextResponse.json({ id }, { status: 201 });
}
