const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET dashboard statistics
router.get('/', (req, res) => {
  try {
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get().count;

    const recentItems = db.prepare(`
      SELECT items.id, items.title_th, items.title_en, items.updated_at, categories.name_th as category_name_th, categories.name_en as category_name_en
      FROM items
      LEFT JOIN categories ON items.category_id = categories.id
      ORDER BY items.updated_at DESC
      LIMIT 5
    `).all();

    const itemsPerCategory = db.prepare(`
      SELECT categories.id, categories.name_th, categories.name_en, COUNT(items.id) as item_count
      FROM categories
      LEFT JOIN items ON categories.id = items.category_id
      GROUP BY categories.id
    `).all();

    res.json({
      success: true,
      data: {
        totalCategories,
        totalItems,
        recentItems,
        itemsPerCategory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
