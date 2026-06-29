import { auth } from "@/lib/auth";
import { Users, Building2, Mail, Shield, Lock, Globe, KeyRound } from "lucide-react";

export default async function EquipePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          Equipe Corporativa
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Usuários sincronizados via Microsoft Entra ID (Azure AD)
        </p>
      </div>

      {/* Current user profile */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Seu Perfil Corporativo
        </h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 grid md:grid-cols-2 gap-3">
            <InfoField label="Nome completo" value={session.user.name ?? "—"} />
            <InfoField label="E-mail corporativo" value={session.user.email ?? "—"} />
            <InfoField label="Departamento" value={session.user.department ?? "Não informado"} />
            <InfoField label="Cargo" value={session.user.jobTitle ?? "Não informado"} />
          </div>
        </div>
      </div>

      {/* Access control model */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-violet-600" />
          Controle de Acesso ao Cérebro (por Setor e Cargo)
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Cada conhecimento tem um escopo. Com base no seu setor
          (<strong>{session.user.department ?? "não definido"}</strong>) e cargo
          (<strong>{session.user.jobTitle ?? "não definido"}</strong>), o sistema decide
          automaticamente o que você vê — e o que as IAs recebem de contexto ao responder para você.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <EscopoCard
            icon={<Lock className="w-4 h-4 text-slate-600" />}
            titulo="Privado"
            descricao="Visível apenas para o autor. Nenhum outro usuário ou IA de terceiros acessa."
            cor="bg-slate-50 border-slate-200"
          />
          <EscopoCard
            icon={<Users className="w-4 h-4 text-violet-600" />}
            titulo="Restrito por setor/cargo"
            descricao="Liberado para setores e cargos específicos. O usuário vê se pertencer a qualquer um deles."
            cor="bg-violet-50 border-violet-200"
          />
          <EscopoCard
            icon={<Globe className="w-4 h-4 text-emerald-600" />}
            titulo="Organização"
            descricao="Disponível para todos os usuários autenticados da empresa."
            cor="bg-emerald-50 border-emerald-200"
          />
        </div>
        <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Garantia de isolamento:</strong> o filtro de acesso é
            aplicado no banco de dados, tanto na listagem do cérebro quanto na montagem do contexto
            enviado ao Claude, Gemini e Copilot. Um conhecimento restrito ao setor Financeiro, por
            exemplo, nunca aparece para alguém de outro setor nem vaza nas respostas das IAs para esse usuário.
          </p>
        </div>
      </div>

      {/* AAD Info */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" />
          Integração Microsoft Entra ID
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <IntegrationCard
            titulo="Autenticação SSO"
            descricao="Login único via Office 365. Sem senhas adicionais."
            status="ativo"
            cor="text-emerald-600"
            bgStatus="bg-emerald-100"
          />
          <IntegrationCard
            titulo="Perfil Automático"
            descricao="Nome, e-mail, cargo e departamento sincronizados do AD."
            status="ativo"
            cor="text-emerald-600"
            bgStatus="bg-emerald-100"
          />
          <IntegrationCard
            titulo="Grupos e Permissões"
            descricao="Acesso baseado em grupos do Azure AD. Configure no portal."
            status="configurar"
            cor="text-amber-600"
            bgStatus="bg-amber-100"
          />
        </div>
      </div>

      {/* AI Identity Federation */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-violet-600" />
          Federação de Identidade IA Enterprise
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Sua identidade Office 365 é utilizada para autenticar em todas as plataformas IA Enterprise.
          Nenhuma credencial adicional é necessária para usuários com licenças Enterprise ativas.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <FederationCard
            nome="Claude Enterprise"
            empresa="Anthropic"
            metodo="API Key via Azure"
            cor="bg-amber-500"
          />
          <FederationCard
            nome="Gemini Enterprise"
            empresa="Google Workspace"
            metodo="OAuth 2.0 (OIDC)"
            cor="bg-blue-500"
          />
          <FederationCard
            nome="Copilot Enterprise"
            empresa="Microsoft 365"
            metodo="Azure AD nativo"
            cor="bg-sky-500"
          />
        </div>

        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Como funciona:</strong> Ao autenticar via Office 365,
            o token JWT do Azure AD é utilizado para identificar o usuário em todas as IAs.
            O Cérebro Corporativo atua como intermediário seguro, enviando contexto personalizado
            para cada assistente sem expor credenciais corporativas.
          </p>
        </div>
      </div>
    </div>
  );
}

function EscopoCard({ icon, titulo, descricao, cor }: { icon: React.ReactNode; titulo: string; descricao: string; cor: string }) {
  return (
    <div className={`rounded-lg p-4 border ${cor}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <p className="font-medium text-slate-900 text-sm">{titulo}</p>
      </div>
      <p className="text-xs text-slate-500 leading-snug">{descricao}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function IntegrationCard({
  titulo,
  descricao,
  status,
  cor,
  bgStatus,
}: {
  titulo: string;
  descricao: string;
  status: string;
  cor: string;
  bgStatus: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-slate-900 text-sm">{titulo}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${bgStatus} ${cor} font-medium`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-500">{descricao}</p>
    </div>
  );
}

function FederationCard({
  nome,
  empresa,
  metodo,
  cor,
}: {
  nome: string;
  empresa: string;
  metodo: string;
  cor: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 ${cor} rounded flex-shrink-0`} />
        <div>
          <p className="font-medium text-slate-900 text-sm">{nome}</p>
          <p className="text-xs text-slate-400">{empresa}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded px-2 py-1">
        {metodo}
      </p>
    </div>
  );
}
