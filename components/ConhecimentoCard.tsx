"use client";

import { useState } from "react";
import { Trash2, Tag, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  item: {
    id: string;
    titulo: string;
    conteudo: string;
    tags: string[];
    fonte_ia: string;
    publico: number;
    atualizado_em: string;
  };
};

const BADGE_CLASSES: Record<string, string> = {
  claude: "ai-badge-claude",
  gemini: "ai-badge-gemini",
  copilot: "ai-badge-copilot",
  manual: "ai-badge-manual",
};

export function ConhecimentoCard({ item }: Props) {
  const router = useRouter();
  const [deletando, setDeletando] = useState(false);

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

  return (
    <div className="card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.titulo}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${BADGE_CLASSES[item.fonte_ia] ?? BADGE_CLASSES.manual}`}>
            {item.fonte_ia}
          </span>
          <button
            onClick={handleDelete}
            disabled={deletando}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-xs line-clamp-3 mb-3">{item.conteudo}</p>

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
        <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
          <Clock className="w-3 h-3" />
          {data}
        </div>
      </div>
    </div>
  );
}
