# 🧠 Second Brain Corporativo — IA Enterprise

Plataforma de **segundo cérebro corporativo** que unifica a identidade dos colaboradores via **Office 365 / Microsoft Entra ID** e conecta os principais assistentes de IA **Enterprise** — **Claude** (Anthropic), **Gemini** (Google) e **Copilot** (Microsoft) — em uma única interface, com **controle de acesso por setor e cargo**.

Cada colaborador enxerga apenas as partes do cérebro que lhe são liberadas, e as IAs recebem como contexto **somente** os conhecimentos que aquele usuário tem permissão de ver.

---

## ✨ Funcionalidades

- **🔐 Identidade unificada via Office 365** — login único (SSO) com Microsoft Entra ID (Azure AD) usando NextAuth v5. Setor (`department`) e cargo (`jobTitle`) são obtidos do Microsoft Graph.
- **🧩 Segundo Cérebro** — base de conhecimento corporativo pesquisável (título, conteúdo, tags, origem).
- **🛡️ Controle de acesso por setor e cargo** — cada conhecimento tem um escopo de visibilidade; o filtro é aplicado no banco e também na montagem do contexto das IAs.
- **🤖 Três IAs Enterprise com streaming** — Claude, Gemini e Copilot em interface unificada, todas alimentadas pelo segundo cérebro (respeitando o acesso do usuário).
- **💾 Salvar respostas no cérebro** — qualquer resposta de IA pode virar conhecimento com um clique.
- **📊 Painel** — estatísticas de uso, conhecimentos visíveis e conversas recentes.
- **👥 Equipe** — perfil corporativo do Azure AD e o modelo de federação de identidade entre as três IAs.

---

## 🔒 Modelo de controle de acesso

Cada item do cérebro possui um **escopo**:

| Escopo | Quem enxerga |
| --- | --- |
| **Privado** | Apenas o autor. |
| **Restrito por setor/cargo** | O autor + qualquer usuário cujo **setor** OU **cargo** esteja na lista de liberados. |
| **Organização** | Todos os usuários autenticados da empresa. |

A regra é aplicada por uma cláusula SQL central (`lib/db.ts`) usada em **todas** as consultas:

```sql
c.usuario_id = @usuarioId                       -- é o autor
OR c.escopo = 'organizacao'                      -- liberado para toda a empresa
OR (c.escopo = 'restrito' AND (                  -- restrito: setor OU cargo liberado
     EXISTS (SELECT 1 FROM json_each(c.setores_permitidos) WHERE value = @setor)
  OR EXISTS (SELECT 1 FROM json_each(c.cargos_permitidos)  WHERE value = @cargo)
))
```

> **Garantia de isolamento:** como o mesmo filtro alimenta a listagem do cérebro **e** o contexto enviado ao Claude, Gemini e Copilot, um conhecimento restrito ao Financeiro nunca aparece — nem vaza nas respostas das IAs — para quem é de outro setor. Edição e exclusão são sempre restritas ao autor.

---

## 🏗️ Arquitetura

```
Office 365 / Entra ID  ──▶  Sessão (setor + cargo)  ──▶  Filtro de acesso
                                                              │
                                                              ▼
                                                    Segundo Cérebro (SQLite)
                                                              │
                            ┌─────────────────────────────────┼─────────────────────────────────┐
                            ▼                                  ▼                                  ▼
                     Claude Enterprise                 Gemini Enterprise                 Copilot Enterprise
                       (Anthropic)                        (Google)                         (Microsoft)
```

### Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **TypeScript** strict
- **NextAuth v5** + provedor Microsoft Entra ID
- **better-sqlite3** (banco local, com JSON1 para o filtro de acesso)
- **Tailwind CSS** + **lucide-react**
- SDKs: `@anthropic-ai/sdk`, `@google/generative-ai`, `openai` (Azure OpenAI)

### Estrutura de pastas

```
app/
  entrar/                    Tela de login (botão Microsoft 365)
  (autenticado)/
    painel/                  Dashboard com estatísticas e acesso do usuário
    cerebro/                 Lista do cérebro (já filtrada por acesso) + /novo
    chat/[assistente]/       Chat com Claude, Gemini ou Copilot
    equipe/                  Perfil corporativo e modelo de acesso
  api/
    auth/[...nextauth]/      Handler NextAuth (+ Microsoft Graph para setor/cargo)
    chat/                    Streaming para a IA, com contexto filtrado por acesso
    conhecimentos/           CRUD do cérebro com controle de acesso
    usuario/perfil/          Perfil + estatísticas do usuário atual
lib/
  auth.ts                    Configuração NextAuth + Entra ID + Graph
  acesso.ts                  Resolve a sessão e o contexto de acesso (setor/cargo)
  organizacao.ts             Setores, cargos e escopos
  db.ts                      SQLite + cláusula central de controle de acesso
  ai/claude|gemini|copilot   Clientes de cada IA com streaming
proxy.ts                     Proteção de rotas (middleware do Next.js 16)
```

---

## 🚀 Como rodar

### 1. Pré-requisitos

- Node.js 20+
- Um **App Registration** no [Azure Portal](https://portal.azure.com) (Microsoft Entra ID)
- Chaves das IAs Enterprise que desejar usar (opcional — sem elas, o chat exibe aviso)

### 2. Instalação

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Acesse http://localhost:3000

### 3. Variáveis de ambiente

```env
# Microsoft Entra ID (Office 365)
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...            # openssl rand -base64 32

# Claude Enterprise (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Gemini Enterprise (Google)
GOOGLE_GEMINI_API_KEY=AIza...

# Copilot Enterprise (Azure OpenAI)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://seu-recurso.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

> O App Registration precisa do escopo de API `User.Read` (Microsoft Graph) para que **setor** e **cargo** sejam lidos e o controle de acesso funcione.

---

## 🧪 Testando o controle de acesso

1. Faça login com um usuário do setor A.
2. Crie um conhecimento com escopo **Restrito**, liberando apenas o setor A.
3. Faça login com um usuário do setor B → o item **não aparece** no cérebro nem influencia as respostas das IAs.
4. Crie um item **Organização** → ele aparece para todos.

---

## 📦 Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run lint` | Lint |

---

## 🔗 Origem

Este projeto evoluiu a partir da pesquisa **OntoTurnover** (ontologia de domínio sobre rotatividade de profissionais), aplicando o conceito de conhecimento organizacional estruturado a uma plataforma prática de IA corporativa.
