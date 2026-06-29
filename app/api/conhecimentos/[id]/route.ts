import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buscarConhecimentoPorId, atualizarConhecimento, deletarConhecimento } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = session.user.id ?? session.user.email;
  const item = buscarConhecimentoPorId(id, userId);
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ ...item, tags: JSON.parse(item.tags || "[]") });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = session.user.id ?? session.user.email;
  const body = await req.json();
  atualizarConhecimento(id, userId, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const userId = session.user.id ?? session.user.email;
  deletarConhecimento(id, userId);
  return NextResponse.json({ ok: true });
}
