"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Brain, Building2, Shield, Zap } from "lucide-react";

export default function EntrarPage() {
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    setCarregando(true);
    await signIn("microsoft-entra-id", { callbackUrl: "/painel" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

        {/* Left - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Cérebro Corporativo</h1>
              <p className="text-indigo-300 text-sm">Plataforma de IA Enterprise</p>
            </div>
          </div>

          <p className="text-slate-300 text-lg leading-relaxed">
            Unifique seu conhecimento corporativo e converse com as principais IAs enterprise
            — Claude, Gemini e Copilot — em um só lugar.
          </p>

          <div className="space-y-4">
            <Feature
              icon={<Shield className="w-5 h-5 text-indigo-400" />}
              titulo="Identidade Office 365"
              descricao="Login seguro via Microsoft Entra ID (Azure AD). Seus dados corporativos, sua identidade."
            />
            <Feature
              icon={<Zap className="w-5 h-5 text-amber-400" />}
              titulo="Três IAs Enterprise"
              descricao="Claude Enterprise, Gemini Enterprise e Microsoft Copilot em uma interface unificada."
            />
            <Feature
              icon={<Building2 className="w-5 h-5 text-emerald-400" />}
              titulo="Segundo Cérebro Corporativo"
              descricao="Base de conhecimento pessoal que alimenta todas as IAs com seu contexto corporativo."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <AILogo color="bg-amber-500" label="Claude" />
            <AILogo color="bg-blue-500" label="Gemini" />
            <AILogo color="bg-sky-500" label="Copilot" />
            <span className="text-slate-500 text-sm ml-1">todos Enterprise</span>
          </div>
        </div>

        {/* Right - Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-9 h-9 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo</h2>
            <p className="text-slate-500 mt-1 text-sm">
              Acesse com sua conta corporativa Office 365
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={carregando}
            className="w-full flex items-center justify-center gap-3 bg-[#0078D4] hover:bg-[#106EBE] text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <MicrosoftIcon />
                <span>Entrar com Microsoft 365</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            Ao entrar, você concorda com as políticas de uso corporativo.
            Sua identidade é gerenciada pelo Azure Active Directory da sua organização.
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              Suporte a{" "}
              <span className="font-medium text-slate-700">Claude Enterprise</span>,{" "}
              <span className="font-medium text-slate-700">Gemini Enterprise</span> e{" "}
              <span className="font-medium text-slate-700">Copilot Enterprise</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, titulo, descricao }: { icon: React.ReactNode; titulo: string; descricao: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white text-sm">{titulo}</p>
        <p className="text-slate-400 text-xs mt-0.5">{descricao}</p>
      </div>
    </div>
  );
}

function AILogo({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 ${color} rounded-md`} />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
