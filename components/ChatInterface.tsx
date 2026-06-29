"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Save, User, Bot } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mensagem = {
  id: string;
  papel: "user" | "assistant";
  conteudo: string;
  carregando?: boolean;
};

type Props = {
  assistente: string;
  nomeAssistente: string;
  corAssistente: string;
};

export function ChatInterface({ assistente, nomeAssistente, corAssistente }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || enviando) return;

    const idUser = crypto.randomUUID();
    const idAssistant = crypto.randomUUID();

    setMensagens((prev) => [
      ...prev,
      { id: idUser, papel: "user", conteudo: texto },
      { id: idAssistant, papel: "assistant", conteudo: "", carregando: true },
    ]);
    setInput("");
    setEnviando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assistente, mensagem: texto, conversa_id: conversaId }),
      });

      if (!res.ok) throw new Error("Erro ao enviar");

      const novaConversaId = res.headers.get("X-Conversa-Id");
      if (novaConversaId && !conversaId) setConversaId(novaConversaId);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let resposta = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resposta += decoder.decode(value);
        setMensagens((prev) =>
          prev.map((m) =>
            m.id === idAssistant ? { ...m, conteudo: resposta, carregando: false } : m
          )
        );
      }
    } catch {
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === idAssistant
            ? { ...m, conteudo: "Erro ao obter resposta. Tente novamente.", carregando: false }
            : m
        )
      );
    } finally {
      setEnviando(false);
      inputRef.current?.focus();
    }
  }

  async function salvarComoConhecimento(conteudo: string, indice: number) {
    const mensagemUser = mensagens[indice - 1]?.conteudo ?? "";
    const titulo = mensagemUser.slice(0, 60) || "Resposta de IA";

    await fetch("/api/conhecimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        conteudo,
        fonte_ia: assistente,
        tags: [assistente, "chat"],
      }),
    });
    router.refresh();
    alert("Conhecimento salvo no seu segundo cérebro!");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  const primeiroNome = session?.user?.name?.split(" ")[0] ?? "Você";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className={`w-16 h-16 ${corAssistente} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
              <span className="text-white font-bold text-2xl">{nomeAssistente[0]}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Olá! Sou o {nomeAssistente}
            </h2>
            <p className="text-slate-500 max-w-md text-sm">
              Estou conectado ao seu segundo cérebro corporativo e pronto para ajudar.
              Como posso ser útil hoje?
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-sm w-full">
              {[
                "Resuma as políticas de RH",
                "Analise o processo de onboarding",
                "Sugira melhorias no workflow",
                "Explique a arquitetura do sistema",
              ].map((sugestao) => (
                <button
                  key={sugestao}
                  onClick={() => { setInput(sugestao); inputRef.current?.focus(); }}
                  className="text-xs text-left p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-600"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((msg, i) => (
          <div key={msg.id} className={`flex gap-3 ${msg.papel === "user" ? "justify-end" : "justify-start"}`}>
            {msg.papel === "assistant" && (
              <div className={`w-8 h-8 ${corAssistente} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.papel === "user" ? "order-1" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.papel === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-900 shadow-sm"
                }`}
              >
                {msg.carregando ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    </div>
                    <span className="text-xs text-slate-400">Pensando...</span>
                  </div>
                ) : (
                  <div className={`prose-chat text-sm whitespace-pre-wrap ${msg.papel === "user" ? "text-white" : ""}`}>
                    {msg.conteudo}
                  </div>
                )}
              </div>
              {msg.papel === "assistant" && !msg.carregando && msg.conteudo && (
                <button
                  onClick={() => salvarComoConhecimento(msg.conteudo, i)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 mt-1 ml-1 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Salvar no Segundo Cérebro
                </button>
              )}
            </div>
            {msg.papel === "user" && (
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${nomeAssistente}... (Enter para enviar, Shift+Enter para nova linha)`}
              className="input resize-none pr-4 min-h-[52px] max-h-[200px] py-3"
              rows={1}
              disabled={enviando}
            />
          </div>
          <button
            onClick={enviar}
            disabled={enviando || !input.trim()}
            className="btn-primary flex-shrink-0 h-[52px] w-[52px] flex items-center justify-center !px-0 !py-0"
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
