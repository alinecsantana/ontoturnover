import OpenAI from "openai";

const client =
  process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT
    ? new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o"}`,
        defaultQuery: { "api-version": "2024-02-01" },
        defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
      })
    : null;

export type Mensagem = { papel: "user" | "assistant"; conteudo: string };

export async function chatCopilot(
  mensagens: Mensagem[],
  contexto?: string
): Promise<ReadableStream> {
  if (!client) {
    return mockStream("⚠️ **Microsoft Copilot Enterprise não configurado.** Defina `AZURE_OPENAI_API_KEY` e `AZURE_OPENAI_ENDPOINT` no `.env.local`.");
  }

  const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
    role: "system",
    content: contexto
      ? `Você é o Microsoft Copilot Enterprise, um assistente corporativo. Use o contexto do segundo cérebro:\n\n${contexto}\n\nResponda sempre em português.`
      : "Você é o Microsoft Copilot Enterprise, um assistente corporativo. Responda sempre em português.",
  };

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    systemMessage,
    ...mensagens.map((m) => ({
      role: m.papel as "user" | "assistant",
      content: m.conteudo,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o",
    messages: openaiMessages,
    stream: true,
    max_tokens: 2048,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(new TextEncoder().encode(delta));
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
