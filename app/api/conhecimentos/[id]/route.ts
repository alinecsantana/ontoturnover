import { NextRequest, NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/acesso";
import { buscarConhecimentoAcessivel, atualizarConhecimento, deletarConhecimento } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // Aplica o controle de acesso: só retorna se o usuário puder ver.
  const item = buscarConhecimentoAcessivel(id, ctx);
  if (!item) return NextResponse.json({ error: "Não encontrado ou sem permissão" }, { status: 404 });

  return NextResponse.json({
    ...item,
    tags: JSON.parse(item.tags || "[]"),
    setores_permitidos: JSON.parse(item.setores_permitidos || "[]"),
    cargos_permitidos: JSON.parse(item.cargos_permitidos || "[]"),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  // atualizarConhecimento já restringe a edição ao dono do conhecimento.
  atualizarConhecimento(id, ctx.usuarioId, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  deletarConhecimento(id, ctx.usuarioId);
  return NextResponse.json({ ok: true });
}
