"use client";

import { useState } from "react";
import { Trash2, Tag, Clock, Lock, Globe, Users, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Escopo } from "@/lib/organizacao";

type Props = {
  item: {
    id: string;
    titulo: string;
    conteudo: string;
    tags: string[];
    fonte_ia: string;
    escopo: Escopo;
    setores_permitidos: string[];
    cargos_permitidos: string[];
    atualizado_em: string;
    proprio?: number;
    autor_nome?: string;
  };
};

const BADGE_CLASSES: Record<string, string> = {
  claude: "ai-badge-claude",
  gemini: "ai-badge-gemini",
  copilot: "ai-badge-copilot",
  manual: "ai-badge-manual",
};

const ESCOPO_INFO: Record<Escopo, { label: string; icon: typeof Lock; cor: string }> = {
  privado: { label: "Privado", icon: Lock, cor: "bg-slate-100 text-slate-600 border-slate-200" },
  restrito: { label: "Restrito", icon: Users, cor: "bg-violet-100 text-violet-700 border-violet-200" },
  organizacao: { label: "Organização", icon: Globe, cor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export function ConhecimentoCard({ item }: Props) {
  const router = useRouter();
  const [deletando, setDeletando] = useState(false);
  const proprio = !!item.proprio;

  async function handleDelete() {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    setDeletando(true);
    try {
      await fetch(`/api/conhecimentos/${item.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletando(false);
    }
  }

  const data = new Date(item.atualizado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const escopo = ESCOPO_INFO[item.escopo] ?? ESCOPO_INFO.privado;
  const EscopoIcon = escopo.icon;

  return (
    <div className="card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.titulo}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${BADGE_CLASSES[item.fonte_ia] ?? BADGE_CLASSES.manual}`}>
            {item.fonte_ia}
          </span>
          {proprio && (
            <button
              onClick={handleDelete}
              disabled={deletando}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-slate-500 text-xs line-clamp-3 mb-3">{item.conteudo}</p>

      {/* Escopo / permissões de acesso */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${escopo.cor}`}>
          <EscopoIcon className="w-3 h-3" />
          {escopo.label}
        </span>
        {item.escopo === "restrito" && item.setores_permitidos.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-3 h-3" />
            {s}
          </span>
        ))}
        {item.escopo === "restrito" && item.cargos_permitidos.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <UserCheck className="w-3 h-3" />
            {c}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="w-3 h-3 text-slate-400" />
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-slate-400">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
          {!proprio && item.autor_nome && (
            <span className="text-slate-400">por {item.autor_nome}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {data}
          </span>
        </div>
      </div>
    </div>
  );
}
