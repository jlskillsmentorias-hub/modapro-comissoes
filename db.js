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
  `);
}

module.exports = {
  db,
  initSchema
};
