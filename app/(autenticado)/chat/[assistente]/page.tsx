import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";

const ASSISTENTES_VALIDOS = ["claude", "gemini", "copilot"] as const;
type Assistente = (typeof ASSISTENTES_VALIDOS)[number];

const INFO: Record<Assistente, { nome: string; cor: string; empresa: string }> = {
  claude: { nome: "Claude Enterprise", cor: "bg-amber-500", empresa: "Anthropic" },
  gemini: { nome: "Gemini Enterprise", cor: "bg-blue-500", empresa: "Google" },
  copilot: { nome: "Copilot Enterprise", cor: "bg-sky-500", empresa: "Microsoft" },
};

export default async function ChatAssistentePage({
  params,
}: {
  params: Promise<{ assistente: string }>;
}) {
  const { assistente: slug } = await params;
  const session = await auth();
  if (!session) redirect("/entrar");

  const assistente = slug as Assistente;
  if (!ASSISTENTES_VALIDOS.includes(assistente)) redirect("/chat");

  const info = INFO[assistente];

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-white">
        <div className={`w-9 h-9 ${info.cor} rounded-xl flex items-center justify-center`}>
          <span className="text-white font-bold">{info.nome[0]}</span>
        </div>
        <div>
          <h1 className="font-semibold text-slate-900">{info.nome}</h1>
          <p className="text-xs text-slate-500">{info.empresa} · Enterprise · Segundo Cérebro Ativo</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface assistente={assistente} nomeAssistente={info.nome} corAssistente={info.cor} />
      </div>
    </div>
  );
}
