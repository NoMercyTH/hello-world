const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single category
router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create category
router.post('/', (req, res) => {
  const { name_th, name_en, description_th, description_en } = req.body;
  if (!name_th || !name_en) {
    return res.status(400).json({ success: false, error: 'Category names (TH and EN) are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO categories (name_th, name_en, description_th, description_en)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(name_th, name_en, description_th || '', description_en || '');
    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update category
router.put('/:id', (req, res) => {
  const { name_th, name_en, description_th, description_en } = req.body;
  if (!name_th || !name_en) {
    return res.status(400).json({ success: false, error: 'Category names (TH and EN) are required' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE categories
      SET name_th = ?, name_en = ?, description_th = ?, description_en = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(name_th, name_en, description_th || '', description_en || '', req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE category
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
