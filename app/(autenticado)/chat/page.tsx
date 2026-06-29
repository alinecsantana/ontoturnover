import Link from "next/link";
import { MessageSquare, ArrowRight, Zap, Brain } from "lucide-react";

const ASSISTENTES = [
  {
    id: "claude",
    nome: "Claude Enterprise",
    empresa: "Anthropic",
    descricao: "Especialista em análise profunda, escrita e raciocínio complexo. Excelente para documentos, código e estratégia.",
    cor: "bg-amber-500",
    borda: "border-amber-200 hover:border-amber-400",
    texto: "text-amber-700",
    bg: "bg-amber-50",
    tag: "Melhor para análise",
  },
  {
    id: "gemini",
    nome: "Gemini Enterprise",
    empresa: "Google",
    descricao: "Multimodal e integrado ao Google Workspace. Ideal para pesquisa, análise de dados e produtividade corporativa.",
    cor: "bg-blue-500",
    borda: "border-blue-200 hover:border-blue-400",
    texto: "text-blue-700",
    bg: "bg-blue-50",
    tag: "Melhor para pesquisa",
  },
  {
    id: "copilot",
    nome: "Copilot Enterprise",
    empresa: "Microsoft",
    descricao: "Integrado ao Microsoft 365. Otimizado para e-mails, reuniões, PowerPoint, Excel e todo o ecossistema Microsoft.",
    cor: "bg-sky-500",
    borda: "border-sky-200 hover:border-sky-400",
    texto: "text-sky-700",
    bg: "bg-sky-50",
    tag: "Melhor para M365",
  },
];

export default function ChatHubPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          Chat com IA Enterprise
        </h1>
        <p className="text-slate-500 mt-1">
          Converse com qualquer assistente. Todos têm acesso ao seu segundo cérebro corporativo.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-900">Segundo Cérebro Ativado</p>
          <p className="text-xs text-indigo-600 mt-0.5">
            Todos os assistentes utilizam automaticamente seu conhecimento corporativo para responder com mais contexto e precisão.
          </p>
        </div>
      </div>

      {/* Assistants */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {ASSISTENTES.map((a) => (
          <div key={a.id} className={`card p-6 border-2 ${a.borda} transition-all hover:shadow-lg group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${a.cor} rounded-xl flex items-center justify-center shadow-sm`}>
                <span className="text-white font-bold text-xl">{a.nome[0]}</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">{a.nome}</h2>
                <p className="text-xs text-slate-500">{a.empresa}</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">{a.descricao}</p>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full border ${a.bg} ${a.texto} border-current font-medium`}>
                {a.tag}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${a.bg} ${a.texto} font-medium`}>
                Enterprise
              </span>
            </div>

            <Link
              href={`/chat/${a.id}`}
              className={`mt-4 w-full flex items-center justify-center gap-2 ${a.cor} hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium transition-all`}
            >
              <Zap className="w-4 h-4" />
              Iniciar Conversa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Architecture info */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          Arquitetura de Identidade Unificada
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
          <ArchBlock
            label="Office 365 / Azure AD"
            sub="Identidade Corporativa"
            cor="bg-blue-100 text-blue-700"
          />
          <ArrowConnector />
          <ArchBlock
            label="Segundo Cérebro"
            sub="Base de Conhecimento"
            cor="bg-indigo-100 text-indigo-700"
          />
          <ArrowConnector />
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-center text-sm mt-4">
          <ArchBlock label="Claude Enterprise" sub="Anthropic" cor="bg-amber-100 text-amber-700" />
          <ArchBlock label="Gemini Enterprise" sub="Google" cor="bg-blue-100 text-blue-700" />
          <ArchBlock label="Copilot Enterprise" sub="Microsoft" cor="bg-sky-100 text-sky-700" />
        </div>
      </div>
    </div>
  );
}

function ArchBlock({ label, sub, cor }: { label: string; sub: string; cor: string }) {
  return (
    <div className={`${cor} rounded-lg p-3`}>
      <p className="font-medium">{label}</p>
      <p className="text-xs opacity-70 mt-0.5">{sub}</p>
    </div>
  );
}

function ArrowConnector() {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight className="w-5 h-5 text-slate-400" />
    </div>
  );
}
