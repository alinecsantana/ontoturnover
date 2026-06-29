import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import type { Escopo } from "@/lib/organizacao";

const DB_PATH = path.join(process.cwd(), "data", "cerebro.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      setor TEXT,
      cargo TEXT,
      foto_url TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conhecimentos (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      fonte_ia TEXT DEFAULT 'manual',
      escopo TEXT DEFAULT 'privado',
      setores_permitidos TEXT DEFAULT '[]',
      cargos_permitidos TEXT DEFAULT '[]',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS conversas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      assistente TEXT NOT NULL,
      titulo TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY,
      conversa_id TEXT NOT NULL,
      papel TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversa_id) REFERENCES conversas(id)
    );

    CREATE INDEX IF NOT EXISTS idx_conhecimentos_usuario ON conhecimentos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_conhecimentos_escopo ON conhecimentos(escopo);
    CREATE INDEX IF NOT EXISTS idx_conversas_usuario ON conversas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
  `);
}

// ============================================================
// Tipos
// ============================================================

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  setor?: string;
  cargo?: string;
  foto_url?: string;
  criado_em: string;
  atualizado_em: string;
};

export type Conhecimento = {
  id: string;
  usuario_id: string;
  titulo: string;
  conteudo: string;
  tags: string;
  fonte_ia: string;
  escopo: Escopo;
  setores_permitidos: string;
  cargos_permitidos: string;
  criado_em: string;
  atualizado_em: string;
  // Campos derivados (não persistidos)
  autor_nome?: string;
  proprio?: number;
};

export type Conversa = {
  id: string;
  usuario_id: string;
  assistente: string;
  titulo?: string;
  criado_em: string;
  total_mensagens?: number;
};

export type Mensagem = {
  id: string;
  conversa_id: string;
  papel: string;
  conteudo: string;
  criado_em: string;
};

/**
 * Contexto de acesso de quem está consultando o cérebro.
 * Define o que o usuário pode ou não enxergar.
 */
export type ContextoAcesso = {
  usuarioId: string;
  setor?: string | null;
  cargo?: string | null;
};

// ============================================================
// Usuários
// ============================================================

export function upsertUsuario(data: {
  id: string;
  email: string;
  nome: string;
  setor?: string | null;
  cargo?: string | null;
  foto_url?: string | null;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO usuarios (id, email, nome, setor, cargo, foto_url)
    VALUES (@id, @email, @nome, @setor, @cargo, @foto_url)
    ON CONFLICT(id) DO UPDATE SET
      nome = excluded.nome,
      setor = excluded.setor,
      cargo = excluded.cargo,
      foto_url = excluded.foto_url,
      atualizado_em = CURRENT_TIMESTAMP
  `).run({
    id: data.id,
    email: data.email,
    nome: data.nome,
    setor: data.setor ?? null,
    cargo: data.cargo ?? null,
    foto_url: data.foto_url ?? null,
  });
}

export function buscarUsuario(id: string): Usuario | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id) as Usuario | undefined;
}

// ============================================================
// Conhecimentos (com controle de acesso por setor/cargo)
// ============================================================

export function criarConhecimento(data: {
  usuario_id: string;
  titulo: string;
  conteudo: string;
  tags?: string[];
  fonte_ia?: string;
  escopo?: Escopo;
  setores_permitidos?: string[];
  cargos_permitidos?: string[];
}): string {
  const db = getDb();
  const id = uuidv4();
  const escopo = data.escopo ?? "privado";
  db.prepare(`
    INSERT INTO conhecimentos
      (id, usuario_id, titulo, conteudo, tags, fonte_ia, escopo, setores_permitidos, cargos_permitidos)
    VALUES
      (@id, @usuario_id, @titulo, @conteudo, @tags, @fonte_ia, @escopo, @setores_permitidos, @cargos_permitidos)
  `).run({
    id,
    usuario_id: data.usuario_id,
    titulo: data.titulo,
    conteudo: data.conteudo,
    tags: JSON.stringify(data.tags ?? []),
    fonte_ia: data.fonte_ia ?? "manual",
    escopo,
    setores_permitidos: JSON.stringify(escopo === "restrito" ? data.setores_permitidos ?? [] : []),
    cargos_permitidos: JSON.stringify(escopo === "restrito" ? data.cargos_permitidos ?? [] : []),
  });
  return id;
}

export function atualizarConhecimento(
  id: string,
  usuario_id: string,
  data: {
    titulo?: string;
    conteudo?: string;
    tags?: string[];
    escopo?: Escopo;
    setores_permitidos?: string[];
    cargos_permitidos?: string[];
  }
) {
  const db = getDb();
  const fields: string[] = ["atualizado_em = CURRENT_TIMESTAMP"];
  const params: Record<string, unknown> = { id, usuario_id };
  if (data.titulo !== undefined) { fields.push("titulo = @titulo"); params.titulo = data.titulo; }
  if (data.conteudo !== undefined) { fields.push("conteudo = @conteudo"); params.conteudo = data.conteudo; }
  if (data.tags !== undefined) { fields.push("tags = @tags"); params.tags = JSON.stringify(data.tags); }
  if (data.escopo !== undefined) { fields.push("escopo = @escopo"); params.escopo = data.escopo; }
  if (data.setores_permitidos !== undefined) {
    fields.push("setores_permitidos = @setores_permitidos");
    params.setores_permitidos = JSON.stringify(data.setores_permitidos);
  }
  if (data.cargos_permitidos !== undefined) {
    fields.push("cargos_permitidos = @cargos_permitidos");
    params.cargos_permitidos = JSON.stringify(data.cargos_permitidos);
  }
  // PUT/edição é restrito ao dono do conhecimento
  db.prepare(`UPDATE conhecimentos SET ${fields.join(", ")} WHERE id = @id AND usuario_id = @usuario_id`).run(params);
}

/**
 * Cláusula SQL central de controle de acesso.
 * Um usuário enxerga um conhecimento se:
 *   - é o autor; OU
 *   - o escopo é "organizacao"; OU
 *   - o escopo é "restrito" e o setor do usuário está liberado; OU
 *   - o escopo é "restrito" e o cargo do usuário está liberado.
 */
const CLAUSULA_ACESSO = `(
  c.usuario_id = @usuarioId
  OR c.escopo = 'organizacao'
  OR (
    c.escopo = 'restrito' AND (
      (@setor IS NOT NULL AND @setor <> '' AND EXISTS (
        SELECT 1 FROM json_each(c.setores_permitidos) WHERE value = @setor
      ))
      OR
      (@cargo IS NOT NULL AND @cargo <> '' AND EXISTS (
        SELECT 1 FROM json_each(c.cargos_permitidos) WHERE value = @cargo
      ))
    )
  )
)`;

function paramsAcesso(ctx: ContextoAcesso) {
  return {
    usuarioId: ctx.usuarioId,
    setor: ctx.setor ?? "",
    cargo: ctx.cargo ?? "",
  };
}

export function listarConhecimentos(ctx: ContextoAcesso, busca?: string): Conhecimento[] {
  const db = getDb();
  const base = `
    SELECT c.*, u.nome AS autor_nome,
      CASE WHEN c.usuario_id = @usuarioId THEN 1 ELSE 0 END AS proprio
    FROM conhecimentos c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    WHERE ${CLAUSULA_ACESSO}
  `;
  if (busca) {
    return db.prepare(`
      ${base} AND (c.titulo LIKE @busca OR c.conteudo LIKE @busca OR c.tags LIKE @busca)
      ORDER BY c.atualizado_em DESC
    `).all({ ...paramsAcesso(ctx), busca: `%${busca}%` }) as Conhecimento[];
  }
  return db.prepare(`${base} ORDER BY c.atualizado_em DESC`).all(paramsAcesso(ctx)) as Conhecimento[];
}

/**
 * Busca um conhecimento aplicando o controle de acesso.
 * Retorna undefined se o usuário não tiver permissão de vê-lo.
 */
export function buscarConhecimentoAcessivel(id: string, ctx: ContextoAcesso): Conhecimento | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, u.nome AS autor_nome,
      CASE WHEN c.usuario_id = @usuarioId THEN 1 ELSE 0 END AS proprio
    FROM conhecimentos c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = @id AND ${CLAUSULA_ACESSO}
  `).get({ ...paramsAcesso(ctx), id }) as Conhecimento | undefined;
}

export function deletarConhecimento(id: string, usuario_id: string) {
  // Exclusão é restrita ao dono
  const db = getDb();
  return db.prepare("DELETE FROM conhecimentos WHERE id = ? AND usuario_id = ?").run(id, usuario_id);
}

export function ultimosConhecimentos(ctx: ContextoAcesso, limite = 5): Conhecimento[] {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, u.nome AS autor_nome,
      CASE WHEN c.usuario_id = @usuarioId THEN 1 ELSE 0 END AS proprio
    FROM conhecimentos c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    WHERE ${CLAUSULA_ACESSO}
    ORDER BY c.atualizado_em DESC
    LIMIT @limite
  `).all({ ...paramsAcesso(ctx), limite }) as Conhecimento[];
}

// ============================================================
// Conversas e mensagens
// ============================================================

export function criarConversa(data: { usuario_id: string; assistente: string; titulo?: string }): string {
  const db = getDb();
  const id = uuidv4();
  db.prepare(`INSERT INTO conversas (id, usuario_id, assistente, titulo) VALUES (@id, @usuario_id, @assistente, @titulo)`)
    .run({ id, usuario_id: data.usuario_id, assistente: data.assistente, titulo: data.titulo ?? null });
  return id;
}

export function listarConversas(usuario_id: string): Conversa[] {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, COUNT(m.id) as total_mensagens
    FROM conversas c
    LEFT JOIN mensagens m ON m.conversa_id = c.id
    WHERE c.usuario_id = ?
    GROUP BY c.id
    ORDER BY c.criado_em DESC
    LIMIT 20
  `).all(usuario_id) as Conversa[];
}

export function adicionarMensagem(data: { conversa_id: string; papel: string; conteudo: string }): string {
  const db = getDb();
  const id = uuidv4();
  db.prepare(`INSERT INTO mensagens (id, conversa_id, papel, conteudo) VALUES (@id, @conversa_id, @papel, @conteudo)`)
    .run({ id, ...data });
  return id;
}

export function buscarMensagens(conversa_id: string): Mensagem[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM mensagens WHERE conversa_id = ? ORDER BY criado_em ASC`).all(conversa_id) as Mensagem[];
}

// ============================================================
// Estatísticas
// ============================================================

export function estatisticas(ctx: ContextoAcesso) {
  const db = getDb();
  // Conhecimentos visíveis para este usuário (próprios + compartilhados)
  const visiveis = (db.prepare(`
    SELECT COUNT(*) as n FROM conhecimentos c WHERE ${CLAUSULA_ACESSO}
  `).get(paramsAcesso(ctx)) as { n: number }).n;
  const proprios = (db.prepare("SELECT COUNT(*) as n FROM conhecimentos WHERE usuario_id = ?").get(ctx.usuarioId) as { n: number }).n;
  const conversas = (db.prepare("SELECT COUNT(*) as n FROM conversas WHERE usuario_id = ?").get(ctx.usuarioId) as { n: number }).n;
  const mensagens = (db.prepare(`
    SELECT COUNT(*) as n FROM mensagens m
    JOIN conversas c ON c.id = m.conversa_id
    WHERE c.usuario_id = ?
  `).get(ctx.usuarioId) as { n: number }).n;
  const porAssistente = db.prepare(`
    SELECT assistente, COUNT(*) as n FROM conversas WHERE usuario_id = ? GROUP BY assistente
  `).all(ctx.usuarioId) as { assistente: string; n: number }[];
  return { conhecimentos: visiveis, proprios, conversas, mensagens, porAssistente };
}
