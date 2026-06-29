"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Brain, Tag, X } from "lucide-react";
import Link from "next/link";

const FONTES_IA = [
  { value: "manual", label: "Manual", cor: "bg-slate-100 text-slate-700" },
  { value: "claude", label: "Claude", cor: "bg-amber-100 text-amber-700" },
  { value: "gemini", label: "Gemini", cor: "bg-blue-100 text-blue-700" },
  { value: "copilot", label: "Copilot", cor: "bg-sky-100 text-sky-700" },
];

export default function NovoConhecimentoPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [fonteIA, setFonteIA] = useState("manual");
  const [publico, setPublico] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function adicionarTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagsInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagsInput("");
    }
  }

  function removerTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !conteudo.trim()) {
      setErro("Título e conteúdo são obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/conhecimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, conteudo, tags, fonte_ia: fonteIA, publico }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      router.push("/cerebro");
      router.refresh();
    } catch {
      setErro("Erro ao salvar o conhecimento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cerebro" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            Novo Conhecimento
          </h1>
          <p className="text-slate-500 text-sm">Adicione ao seu segundo cérebro corporativo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            placeholder="Ex: Política de férias 2024, Processo de onboarding, Arquitetura do sistema..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Conteúdo <span className="text-red-500">*</span>
          </label>
          <textarea
            className="input min-h-[200px] resize-y"
            placeholder="Descreva o conhecimento em detalhes. Quanto mais completo, melhor as IAs poderão utilizá-lo..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            required
          />
          <p className="text-xs text-slate-400 mt-1">{conteudo.length} caracteres</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </label>
          <div className="input flex flex-wrap gap-1.5 min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removerTag(tag)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              placeholder={tags.length === 0 ? "Digite e pressione Enter..." : ""}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={adicionarTag}
            />
          </div>
        </div>

        {/* Fonte IA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fonte / Origem</label>
          <div className="flex flex-wrap gap-2">
            {FONTES_IA.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFonteIA(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  fonteIA === f.value
                    ? `${f.cor} border-transparent ring-2 ring-indigo-500 ring-offset-1`
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Público */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="publico"
            checked={publico}
            onChange={(e) => setPublico(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <label htmlFor="publico" className="text-sm text-slate-700">
            Compartilhar com a equipe (visível para outros usuários)
          </label>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2">
            {salvando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {salvando ? "Salvando..." : "Salvar Conhecimento"}
          </button>
          <Link href="/cerebro" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
