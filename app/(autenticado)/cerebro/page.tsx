import { sessaoAtual } from "@/lib/acesso";
import { listarConhecimentos } from "@/lib/db";
import Link from "next/link";
import { Plus, Search, BookOpen, Brain, ShieldCheck } from "lucide-react";
import { ConhecimentoCard } from "@/components/ConhecimentoCard";

export default async function CerebroPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await sessaoAtual();
  if (!ctx) return null;

  const { q: busca } = await searchParams;
  const itens = listarConhecimentos(ctx, busca);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-600" />
            Segundo Cérebro
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sua base de conhecimento corporativo pessoal
          </p>
        </div>
        <Link href="/cerebro/novo" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Conhecimento
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="q"
            defaultValue={busca}
            placeholder="Buscar no seu segundo cérebro..."
            className="input pl-10 max-w-md"
          />
        </div>
      </form>

      {/* Access notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-6 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Você está vendo apenas os conhecimentos liberados ao seu acesso —
          os seus próprios, os de toda a organização e os restritos ao seu setor
          (<strong>{ctx.setor ?? "não definido"}</strong>) ou cargo
          (<strong>{ctx.cargo ?? "não definido"}</strong>).
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {itens.length} {itens.length === 1 ? "item visível" : "itens visíveis"}
          {busca ? ` para "${busca}"` : ""}
        </span>
        <span className="text-slate-300">|</span>
        <span>Ordenado por mais recente</span>
      </div>

      {/* Content */}
      {itens.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">
            {busca ? "Nenhum resultado encontrado" : "Seu segundo cérebro está vazio"}
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {busca
              ? `Tente buscar por outros termos.`
              : "Adicione conhecimentos para que as IAs corporativas possam usá-los em suas respostas."}
          </p>
          {!busca && (
            <Link href="/cerebro/novo" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Conhecimento
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {itens.map((item) => (
            <ConhecimentoCard
              key={item.id}
              item={{
                ...item,
                tags: JSON.parse(item.tags || "[]"),
                setores_permitidos: JSON.parse(item.setores_permitidos || "[]"),
                cargos_permitidos: JSON.parse(item.cargos_permitidos || "[]"),
                proprio: item.proprio ?? 0,
                autor_nome: item.autor_nome,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
