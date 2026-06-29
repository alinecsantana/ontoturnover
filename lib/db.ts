import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

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
      departamento TEXT,
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
      publico INTEGER DEFAULT 0,
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
    CREATE INDEX IF NOT EXISTS idx_conversas_usuario ON conversas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id);
  `);
}

export type Usuario = {
  id: string;
  email: string;
  nome: string;
  departamento?: string;
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
  publico: number;
  criado_em: string;
  atualizado_em: string;
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

export function upsertUsuario(data: {
  id: string;
  email: string;
  nome: string;
  departamento?: string | null;
  cargo?: string | null;
  foto_url?: string | null;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO usuarios (id, email, nome, departamento, cargo, foto_url)
    VALUES (@id, @email, @nome, @departamento, @cargo, @foto_url)
    ON CONFLICT(id) DO UPDATE SET
      nome = excluded.nome,
      departamento = excluded.departamento,
      cargo = excluded.cargo,
      foto_url = excluded.foto_url,
      atualizado_em = CURRENT_TIMESTAMP
  `).run({
    id: data.id,
    email: data.email,
    nome: data.nome,
    departamento: data.departamento ?? null,
    cargo: data.cargo ?? null,
    foto_url: data.foto_url ?? null,
  });
}

export function buscarUsuario(id: string): Usuario | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id) as Usuario | undefined;
}

export function criarConhecimento(data: {
  usuario_id: string;
  titulo: string;
  conteudo: string;
  tags?: string[];
  fonte_ia?: string;
  publico?: boolean;
}): string {
  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO conhecimentos (id, usuario_id, titulo, conteudo, tags, fonte_ia, publico)
    VALUES (@id, @usuario_id, @titulo, @conteudo, @tags, @fonte_ia, @publico)
  `).run({
    id,
    usuario_id: data.usuario_id,
    titulo: data.titulo,
    conteudo: data.conteudo,
    tags: JSON.stringify(data.tags ?? []),
    fonte_ia: data.fonte_ia ?? "manual",
    publico: data.publico ? 1 : 0,
  });
  return id;
}

export function atualizarConhecimento(
  id: string,
  usuario_id: string,
  data: { titulo?: string; conteudo?: string; tags?: string[]; publico?: boolean }
) {
  const db = getDb();
  const fields: string[] = ["atualizado_em = CURRENT_TIMESTAMP"];
  const params: Record<string, unknown> = { id, usuario_id };
  if (data.titulo !== undefined) { fields.push("titulo = @titulo"); params.titulo = data.titulo; }
  if (data.conteudo !== undefined) { fields.push("conteudo = @conteudo"); params.conteudo = data.conteudo; }
  if (data.tags !== undefined) { fields.push("tags = @tags"); params.tags = JSON.stringify(data.tags); }
  if (data.publico !== undefined) { fields.push("publico = @publico"); params.publico = data.publico ? 1 : 0; }
  db.prepare(`UPDATE conhecimentos SET ${fields.join(", ")} WHERE id = @id AND usuario_id = @usuario_id`).run(params);
}

export function listarConhecimentos(usuario_id: string, busca?: string): Conhecimento[] {
  const db = getDb();
  if (busca) {
    return db.prepare(`
      SELECT * FROM conhecimentos
      WHERE usuario_id = ? AND (titulo LIKE ? OR conteudo LIKE ? OR tags LIKE ?)
      ORDER BY atualizado_em DESC
    `).all(usuario_id, `%${busca}%`, `%${busca}%`, `%${busca}%`) as Conhecimento[];
  }
  return db.prepare(`
    SELECT * FROM conhecimentos WHERE usuario_id = ? ORDER BY atualizado_em DESC
  `).all(usuario_id) as Conhecimento[];
}

export function buscarConhecimentoPorId(id: string, usuario_id: string): Conhecimento | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM conhecimentos WHERE id = ? AND usuario_id = ?").get(id, usuario_id) as Conhecimento | undefined;
}

export function deletarConhecimento(id: string, usuario_id: string) {
  const db = getDb();
  return db.prepare("DELETE FROM conhecimentos WHERE id = ? AND usuario_id = ?").run(id, usuario_id);
}

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

export function estatisticas(usuario_id: string) {
  const db = getDb();
  const conhecimentos = (db.prepare("SELECT COUNT(*) as n FROM conhecimentos WHERE usuario_id = ?").get(usuario_id) as { n: number }).n;
  const conversas = (db.prepare("SELECT COUNT(*) as n FROM conversas WHERE usuario_id = ?").get(usuario_id) as { n: number }).n;
  const mensagens = (db.prepare(`
    SELECT COUNT(*) as n FROM mensagens m
    JOIN conversas c ON c.id = m.conversa_id
    WHERE c.usuario_id = ?
  `).get(usuario_id) as { n: number }).n;
  const porAssistente = db.prepare(`
    SELECT assistente, COUNT(*) as n FROM conversas WHERE usuario_id = ? GROUP BY assistente
  `).all(usuario_id) as { assistente: string; n: number }[];
  return { conhecimentos, conversas, mensagens, porAssistente };
}

export function ultimosConhecimentos(usuario_id: string, limite = 5): Conhecimento[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM conhecimentos WHERE usuario_id = ? ORDER BY atualizado_em DESC LIMIT ?`).all(usuario_id, limite) as Conhecimento[];
}
