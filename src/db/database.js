const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '../../repository.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_th TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_th TEXT,
      description_en TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_th TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_th TEXT,
      description_en TEXT,
      content_th TEXT,
      content_en TEXT,
      category_id INTEGER,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // Insert default categories if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (name_th, name_en, description_th, description_en)
      VALUES (?, ?, ?, ?)
    `);
    insertCat.run('การใช้งานทั่วไป / General', 'General', 'หมวดหมู่ทั่วไปสำหรับจัดเก็บข้อมูล', 'General category for repository items');
    insertCat.run('เอกสารและคู่มือ / Docs', 'Documentation', 'คลังเอกสาร คู่มือการใช้งาน และความรู้', 'Manuals, guides, and documentation');
    insertCat.run('สื่อและทรัพยากร / Resources', 'Resources', 'ลิงก์ เว็บไซต์ และทรัพยากรที่สำคัญ', 'Important links, web resources, and files');
  }
}

initDb();

module.exports = db;
