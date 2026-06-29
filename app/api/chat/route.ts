import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { chatClaude } from "@/lib/ai/claude";
import { chatGemini } from "@/lib/ai/gemini";
import { chatCopilot } from "@/lib/ai/copilot";
import { criarConversa, adicionarMensagem, buscarMensagens, listarConhecimentos, upsertUsuario } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
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

  const body = await request.json();
  const { assistente, mensagem, conversa_id } = body as {
    assistente: "claude" | "gemini" | "copilot";
    mensagem: string;
    conversa_id?: string;
  };

  if (!assistente || !mensagem) {
    return new Response(JSON.stringify({ error: "assistente e mensagem são obrigatórios" }), { status: 400 });
  }

  let conversaId = conversa_id;
  if (!conversaId) {
    conversaId = criarConversa({
      usuario_id: userId,
      assistente,
      titulo: mensagem.slice(0, 60),
    });
  }

  adicionarMensagem({ conversa_id: conversaId, papel: "user", conteudo: mensagem });

  const mensagensDb = buscarMensagens(conversaId);
  const mensagensIA = mensagensDb.map((m) => ({
    papel: m.papel as "user" | "assistant",
    conteudo: m.conteudo,
  }));

  // Build context from knowledge base (top 3 most recent items)
  const conhecimentos = listarConhecimentos(userId);
  const contexto = conhecimentos
    .slice(0, 3)
    .map((k) => `## ${k.titulo}\n${k.conteudo}`)
    .join("\n\n---\n\n");

  let aiStream: ReadableStream;
  if (assistente === "claude") {
    aiStream = await chatClaude(mensagensIA, contexto || undefined);
  } else if (assistente === "gemini") {
    aiStream = await chatGemini(mensagensIA, contexto || undefined);
  } else {
    aiStream = await chatCopilot(mensagensIA, contexto || undefined);
  }

  // Collect full response to save in DB
  const [stream1, stream2] = aiStream.tee();

  (async () => {
    const reader = stream1.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value);
    }
    adicionarMensagem({ conversa_id: conversaId!, papel: "assistant", conteudo: fullResponse });
  })();

  return new Response(stream2, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversa-Id": conversaId,
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
