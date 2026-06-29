"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Brain, Tag, X, Lock, Users, Globe, Check } from "lucide-react";
import Link from "next/link";
import { SETORES, CARGOS, ESCOPOS, type Escopo } from "@/lib/organizacao";

const FONTES_IA = [
  { value: "manual", label: "Manual", cor: "bg-slate-100 text-slate-700" },
  { value: "claude", label: "Claude", cor: "bg-amber-100 text-amber-700" },
  { value: "gemini", label: "Gemini", cor: "bg-blue-100 text-blue-700" },
  { value: "copilot", label: "Copilot", cor: "bg-sky-100 text-sky-700" },
];

const ESCOPO_ICON: Record<Escopo, typeof Lock> = {
  privado: Lock,
  restrito: Users,
  organizacao: Globe,
};

export default function NovoConhecimentoPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [fonteIA, setFonteIA] = useState("manual");
  const [escopo, setEscopo] = useState<Escopo>("privado");
  const [setores, setSetores] = useState<string[]>([]);
  const [cargos, setCargos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function adicionarTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagsInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) setTags([...tags, tag]);
      setTagsInput("");
    }
  }

  function toggle(lista: string[], setter: (v: string[]) => void, valor: string) {
    setter(lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim() || !conteudo.trim()) {
      setErro("Título e conteúdo são obrigatórios.");
      return;
    }
    if (escopo === "restrito" && setores.length === 0 && cargos.length === 0) {
      setErro("Para o escopo restrito, selecione ao menos um setor ou cargo liberado.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/conhecimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          conteudo,
          tags,
          fonte_ia: fonteIA,
          escopo,
          setores_permitidos: escopo === "restrito" ? setores : [],
          cargos_permitidos: escopo === "restrito" ? cargos : [],
        }),
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
          <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </label>
          <div className="input flex flex-wrap gap-1.5 min-h-[42px]">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-indigo-900">
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

        {/* Controle de acesso */}
        <div className="border-t border-slate-200 pt-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quem pode ver este conhecimento?
          </label>
          <p className="text-xs text-slate-400 mb-3">
            O controle de acesso define quais setores e cargos enxergam este item no cérebro — e qual contexto as IAs recebem para cada usuário.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {ESCOPOS.map((opt) => {
              const Icon = ESCOPO_ICON[opt.value];
              const ativo = escopo === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEscopo(opt.value)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    ativo ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${ativo ? "text-indigo-600" : "text-slate-500"}`} />
                    <span className={`text-sm font-medium ${ativo ? "text-indigo-700" : "text-slate-700"}`}>
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{opt.descricao}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seleção de setores e cargos (escopo restrito) */}
        {escopo === "restrito" && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Setores liberados
              </label>
              <div className="flex flex-wrap gap-2">
                {SETORES.map((s) => {
                  const ativo = setores.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(setores, setSetores, s)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        ativo ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {ativo && <Check className="w-3 h-3" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-600" />
                Cargos liberados
              </label>
              <div className="flex flex-wrap gap-2">
                {CARGOS.map((c) => {
                  const ativo = cargos.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(cargos, setCargos, c)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        ativo ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
                      }`}
                    >
                      {ativo && <Check className="w-3 h-3" />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Um usuário verá este conhecimento se pertencer a <strong>qualquer</strong> setor
              ou cargo selecionado acima. Você, como autor, sempre tem acesso.
            </p>
          </div>
        )}

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
