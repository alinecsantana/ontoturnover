import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null;

export type Mensagem = { papel: "user" | "assistant"; conteudo: string };

export async function chatGemini(
  mensagens: Mensagem[],
  contexto?: string
): Promise<ReadableStream> {
  if (!genAI) {
    return mockStream("⚠️ **Gemini Enterprise não configurado.** Defina `GOOGLE_GEMINI_API_KEY` no `.env.local` para usar o Gemini Enterprise.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: contexto
      ? `Você é um assistente corporativo inteligente. Use o seguinte contexto do segundo cérebro do usuário:\n\n${contexto}\n\nResponda sempre em português.`
      : "Você é um assistente corporativo inteligente. Responda sempre em português.",
  });

  const historico = mensagens.slice(0, -1).map((m) => ({
    role: m.papel === "user" ? "user" : ("model" as const),
    parts: [{ text: m.conteudo }],
  }));

  const ultimaMensagem = mensagens[mensagens.length - 1];
  const chat = model.startChat({ history: historico });
  const result = await chat.sendMessageStream(ultimaMensagem.conteudo);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const texto = chunk.text();
          if (texto) {
            controller.enqueue(new TextEncoder().encode(texto));
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
