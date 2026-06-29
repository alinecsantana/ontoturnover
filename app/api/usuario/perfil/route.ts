import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { upsertUsuario, buscarUsuario, estatisticas } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id ?? session.user.email;

  upsertUsuario({
    id: userId,
    email: session.user.email,
    nome: session.user.name ?? session.user.email,
    departamento: session.user.department,
    cargo: session.user.jobTitle,
    foto_url: session.user.image,
  });

  const usuario = buscarUsuario(userId);
  const stats = estatisticas(userId);

  return NextResponse.json({ usuario, stats, session: session.user });
}
