import Anthropic from "@anthropic-ai/sdk";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export type Mensagem = { papel: "user" | "assistant"; conteudo: string };

export async function chatClaude(
  mensagens: Mensagem[],
  contexto?: string
): Promise<ReadableStream> {
  if (!client) {
    return mockStream("⚠️ **Claude Enterprise não configurado.** Defina `ANTHROPIC_API_KEY` no `.env.local` para usar o Claude Enterprise.");
  }

  const systemPrompt = contexto
    ? `Você é um assistente corporativo inteligente. Use o seguinte contexto do segundo cérebro do usuário para enriquecer suas respostas:\n\n${contexto}\n\nResponda sempre em português, de forma clara e objetiva.`
    : "Você é um assistente corporativo inteligente. Responda sempre em português, de forma clara e objetiva.";

  const stream = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system: systemPrompt,
    messages: mensagens.map((m) => ({
      role: m.papel,
      content: m.conteudo,
    })),
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

function mockStream(text: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}
