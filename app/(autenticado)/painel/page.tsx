import { auth } from "@/lib/auth";
import { estatisticas, ultimosConhecimentos, listarConversas, upsertUsuario } from "@/lib/db";
import Link from "next/link";
import { BookOpen, MessageSquare, Lightbulb, TrendingUp, Plus, ArrowRight } from "lucide-react";

const AI_INFO = {
  claude: { nome: "Claude Enterprise", cor: "bg-amber-500", texto: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  gemini: { nome: "Gemini Enterprise", cor: "bg-blue-500", texto: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  copilot: { nome: "Copilot Enterprise", cor: "bg-sky-500", texto: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
};

export default async function PainelPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id ?? session.user.email ?? "";

  upsertUsuario({
    id: userId,
    email: session.user.email ?? "",
    nome: session.user.name ?? "",
    departamento: session.user.department,
    cargo: session.user.jobTitle,
    foto_url: session.user.image,
  });

  const stats = estatisticas(userId);
  const recentes = ultimosConhecimentos(userId, 4);
  const conversas = listarConversas(userId).slice(0, 3);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const primeiroNome = session.user.name?.split(" ")[0] ?? "Usuário";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {saudacao}, {primeiroNome}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {session.user.jobTitle && `${session.user.jobTitle} · `}
          {session.user.department && `${session.user.department} · `}
          {session.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
          valor={stats.conhecimentos}
          label="Conhecimentos"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
          valor={stats.conversas}
          label="Conversas"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Lightbulb className="w-5 h-5 text-amber-600" />}
          valor={stats.mensagens}
          label="Mensagens"
          bg="bg-amber-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          valor={stats.porAssistente.length}
          label="IAs utilizadas"
          bg="bg-violet-50"
        />
      </div>

      {/* AI Assistants */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Assistentes Enterprise</h2>
          <Link href="/chat" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {(["claude", "gemini", "copilot"] as const).map((ai) => {
            const info = AI_INFO[ai];
            const total = stats.porAssistente.find((p) => p.assistente === ai)?.n ?? 0;
            return (
              <Link key={ai} href={`/chat/${ai}`} className="card p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${info.cor} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{info.nome[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{info.nome}</p>
                    <p className="text-xs text-slate-500">{total} conversas</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${info.bg} ${info.texto} font-medium`}>
                    Enterprise
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Knowledge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Segundo Cérebro Recente</h2>
            <Link href="/cerebro" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentes.length === 0 ? (
            <EmptyState
              href="/cerebro/novo"
              texto="Nenhum conhecimento ainda. Adicione o primeiro!"
              acao="Adicionar Conhecimento"
            />
          ) : (
            <div className="space-y-3">
              {recentes.map((k) => (
                <div key={k.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{k.titulo}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{k.conteudo}</p>
                    </div>
                    <AIBadge fonte={k.fonte_ia} />
                  </div>
                </div>
              ))}
              <Link href="/cerebro/novo" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mt-2">
                <Plus className="w-4 h-4" />
                Adicionar novo
              </Link>
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Conversas Recentes</h2>
            <Link href="/chat" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {conversas.length === 0 ? (
            <EmptyState
              href="/chat"
              texto="Nenhuma conversa ainda. Comece a interagir com as IAs!"
              acao="Iniciar Chat"
            />
          ) : (
            <div className="space-y-3">
              {conversas.map((c) => {
                const info = AI_INFO[c.assistente as keyof typeof AI_INFO];
                return (
                  <Link key={c.id} href={`/chat/${c.assistente}`} className="card p-4 hover:shadow-md transition-shadow block">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${info?.cor ?? "bg-slate-400"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{c.assistente[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{c.titulo ?? "Conversa sem título"}</p>
                        <p className="text-slate-500 text-xs">{c.total_mensagens} mensagens · {info?.nome}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, valor, label, bg }: { icon: React.ReactNode; valor: number; label: string; bg: string }) {
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900">{valor}</p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}

function AIBadge({ fonte }: { fonte: string }) {
  const classes: Record<string, string> = {
    claude: "ai-badge-claude",
    gemini: "ai-badge-gemini",
    copilot: "ai-badge-copilot",
    manual: "ai-badge-manual",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${classes[fonte] ?? classes.manual}`}>
      {fonte}
    </span>
  );
}

function EmptyState({ href, texto, acao }: { href: string; texto: string; acao: string }) {
  return (
    <div className="card p-6 text-center border-dashed">
      <p className="text-slate-500 text-sm mb-3">{texto}</p>
      <Link href={href} className="btn-primary inline-flex items-center gap-2">
        <Plus className="w-4 h-4" />
        {acao}
      </Link>
    </div>
  );
}
