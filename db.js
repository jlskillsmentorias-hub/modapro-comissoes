const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.join(__dirname, 'modaflow.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for speed and reliability
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      hire_date TEXT,
      base_commission_rate REAL DEFAULT 4.0,
      color_theme TEXT DEFAULT '#6366f1',
      current_level TEXT DEFAULT 'Estilo Prata',
      badge TEXT DEFAULT '🔥 Ativo'
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      standard_bonus_rate REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      bonus_rate REAL NOT NULL,
      category_target TEXT DEFAULT 'TODAS',
      is_active INTEGER DEFAULT 1,
      color TEXT DEFAULT '#ec4899',
      icon TEXT DEFAULT '✨'
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period TEXT NOT NULL, -- Format YYYY-MM
      seller_id INTEGER,    -- NULL means company overall goal
      target_amount REAL NOT NULL,
      super_target_amount REAL NOT NULL,
      bonus_multiplier REAL DEFAULT 1.25,
      FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      seller_id INTEGER NOT NULL,
      customer_name TEXT,
      category TEXT NOT NULL,
      items_count INTEGER DEFAULT 1,
      total_amount REAL NOT NULL,
      base_commission_rate REAL NOT NULL,
      campaign_id INTEGER,
      campaign_bonus_rate REAL DEFAULT 0,
      total_commission_rate REAL NOT NULL,
      commission_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Cartão Crédito',
      sale_date TEXT NOT NULL, -- YYYY-MM-DD HH:MM:SS
      FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'admin' ou 'employee'
      seller_id INTEGER,  -- Vinculado a um vendedor na tabela sellers (opcional)
      avatar TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(seller_id) REFERENCES sellers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedUsersIfEmpty();
}

const crypto = require('node:crypto');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function verifyPassword(password, salt, hash) {
  const testHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

function seedUsersIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (count > 0) return;

  console.log('🔐 Criando usuários padrão com níveis de acesso (Admin e Funcionários)...');

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, salt, name, role, seller_id, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // 1. Usuário Administrador
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword('admin123', adminSalt);
  insertUser.run(
    'admin',
    adminHash,
    adminSalt,
    'Diretoria & Gerência',
    'admin',
    null,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
  );

  // 2. Vendedores pré-cadastrados como Funcionários
  const sellers = db.prepare('SELECT * FROM sellers').all();
  for (const seller of sellers) {
    // Gerar username a partir do primeiro nome
    const firstName = seller.name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const empSalt = crypto.randomBytes(16).toString('hex');
    const empHash = hashPassword('123456', empSalt); // Senha padrão para funcionários

    try {
      insertUser.run(
        firstName,
        empHash,
        empSalt,
        seller.name,
        'employee',
        seller.id,
        seller.avatar
      );
    } catch (e) {
      // Ignora se username já existir
    }
  }

  // 3. Usuário Funcionário Genérico
  const genericSalt = crypto.randomBytes(16).toString('hex');
  const genericHash = hashPassword('vendedor123', genericSalt);
  try {
    insertUser.run(
      'vendedor',
      genericHash,
      genericSalt,
      'Consultor Geral de Vendas',
      'employee',
      sellers.length > 0 ? sellers[0].id : null,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    );
  } catch (e) {}

  console.log('✅ Usuários padrão criados com sucesso!');
}

module.exports = {
  db,
  initSchema,
  hashPassword,
  verifyPassword,
  seedUsersIfEmpty
};
