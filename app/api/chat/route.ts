import { NextRequest } from "next/server";
import { sessaoAtual } from "@/lib/acesso";
import { chatClaude } from "@/lib/ai/claude";
import { chatGemini } from "@/lib/ai/gemini";
import { chatCopilot } from "@/lib/ai/copilot";
import { criarConversa, adicionarMensagem, buscarMensagens, listarConhecimentos } from "@/lib/db";

export async function POST(request: NextRequest) {
  const ctx = await sessaoAtual();
  if (!ctx) {
    return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
  }

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
      usuario_id: ctx.usuarioId,
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

  // Contexto do cérebro: SOMENTE conhecimentos que este usuário pode ver,
  // respeitando o controle de acesso por setor e cargo.
  const conhecimentos = listarConhecimentos(ctx);
  const contexto = conhecimentos
    .slice(0, 5)
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

  // Espelha o stream: um lado vai para o cliente, outro persiste no banco.
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
    },
  });
}
