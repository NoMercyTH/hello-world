const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET Export data as JSON
router.get('/export', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    const items = db.prepare('SELECT * FROM items').all();

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      items
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="repository_backup.json"');
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Import data from JSON
router.post('/import', (req, res) => {
  const { categories, items } = req.body;
  if (!Array.isArray(categories) || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Invalid data format. "categories" and "items" arrays are required.' });
  }

  try {
    const transaction = db.transaction(() => {
      // Clear existing
      db.prepare('DELETE FROM items').run();
      db.prepare('DELETE FROM categories').run();

      const insertCat = db.prepare(`
        INSERT INTO categories (id, name_th, name_en, description_th, description_en, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const cat of categories) {
        insertCat.run(
          cat.id,
          cat.name_th,
          cat.name_en,
          cat.description_th || '',
          cat.description_en || '',
          cat.created_at || new Date().toISOString(),
          cat.updated_at || new Date().toISOString()
        );
      }

      const insertItem = db.prepare(`
        INSERT INTO items (id, title_th, title_en, description_th, description_en, content_th, content_en, category_id, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of items) {
        insertItem.run(
          item.id,
          item.title_th,
          item.title_en,
          item.description_th || '',
          item.description_en || '',
          item.content_th || '',
          item.content_en || '',
          item.category_id || null,
          item.tags || '',
          item.created_at || new Date().toISOString(),
          item.updated_at || new Date().toISOString()
        );
      }
    });

    transaction();
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
