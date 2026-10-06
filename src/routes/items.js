const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all items (with optional search query & category filter)
router.get('/', (req, res) => {
  const { search, category_id } = req.query;
  try {
    let sql = `
      SELECT items.*, categories.name_th as category_name_th, categories.name_en as category_name_en
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ` AND items.category_id = ?`;
      params.push(category_id);
    }

    if (search) {
      sql += ` AND (
        items.title_th LIKE ? OR items.title_en LIKE ? OR
        items.description_th LIKE ? OR items.description_en LIKE ? OR
        items.content_th LIKE ? OR items.content_en LIKE ? OR
        items.tags LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY items.updated_at DESC`;

    const items = db.prepare(sql).all(...params);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single item
router.get('/:id', (req, res) => {
  try {
    const sql = `
      SELECT items.*, categories.name_th as category_name_th, categories.name_en as category_name_en
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      WHERE items.id = ?
    `;
    const item = db.prepare(sql).get(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create item
router.post('/', (req, res) => {
  const { title_th, title_en, description_th, description_en, content_th, content_en, category_id, tags } = req.body;
  if (!title_th || !title_en) {
    return res.status(400).json({ success: false, error: 'Item titles (TH and EN) are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO items (title_th, title_en, description_th, description_en, content_th, content_en, category_id, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title_th,
      title_en,
      description_th || '',
      description_en || '',
      content_th || '',
      content_en || '',
      category_id || null,
      tags || ''
    );

    const newItem = db.prepare(`
      SELECT items.*, categories.name_th as category_name_th, categories.name_en as category_name_en
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      WHERE items.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update item
router.put('/:id', (req, res) => {
  const { title_th, title_en, description_th, description_en, content_th, content_en, category_id, tags } = req.body;
  if (!title_th || !title_en) {
    return res.status(400).json({ success: false, error: 'Item titles (TH and EN) are required' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE items
      SET title_th = ?, title_en = ?, description_th = ?, description_en = ?,
          content_th = ?, content_en = ?, category_id = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(
      title_th,
      title_en,
      description_th || '',
      description_en || '',
      content_th || '',
      content_en || '',
      category_id || null,
      tags || '',
      req.params.id
    );

    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updatedItem = db.prepare(`
      SELECT items.*, categories.name_th as category_name_th, categories.name_en as category_name_en
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      WHERE items.id = ?
    `).get(req.params.id);

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE item
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
