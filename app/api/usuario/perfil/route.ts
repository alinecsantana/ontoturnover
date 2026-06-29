import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/acesso";
import { buscarUsuario, estatisticas } from "@/lib/db";

export async function GET() {
  const ctx = await sessaoAtual();
  if (!ctx) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const usuario = buscarUsuario(ctx.usuarioId);
  const stats = estatisticas(ctx);

  return NextResponse.json({
    usuario,
    stats,
    acesso: { setor: ctx.setor, cargo: ctx.cargo },
  });
}
