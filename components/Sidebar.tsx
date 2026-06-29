"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/painel", icon: LayoutDashboard, label: "Painel" },
  { href: "/cerebro", icon: BookOpen, label: "Segundo Cérebro" },
  { href: "/chat", icon: MessageSquare, label: "Chat com IA" },
  { href: "/equipe", icon: Users, label: "Equipe" },
];

const assistentes = [
  { href: "/chat/claude", label: "Claude Enterprise", color: "bg-amber-500", dot: "text-amber-400" },
  { href: "/chat/gemini", label: "Gemini Enterprise", color: "bg-blue-500", dot: "text-blue-400" },
  { href: "/chat/copilot", label: "Copilot Enterprise", color: "bg-sky-500", dot: "text-sky-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/painel" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Cérebro Corporativo</p>
            <p className="text-slate-500 text-xs">Plataforma IA Enterprise</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx("sidebar-item", pathname.startsWith(item.href) && "active")}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 pb-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Assistentes IA
          </p>
          {assistentes.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={clsx("sidebar-item", pathname === a.href && "active")}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.color}`} />
              <span className="truncate">{a.label}</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
            </Link>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{session?.user?.name ?? "Usuário"}</p>
            <p className="text-slate-500 text-xs truncate">{session?.user?.email ?? ""}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/entrar" })}
            className="text-slate-500 hover:text-white transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
