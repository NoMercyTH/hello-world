const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db/database');

describe('Repository Application API Tests', () => {
  beforeAll(() => {
    // Ensure db initialized
  });

  afterAll(() => {
    db.close();
  });

  let createdCategoryId;
  let createdItemId;

  test('GET /api/categories - should list initial categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('POST /api/categories - should create a new category', async () => {
    const newCat = {
      name_th: 'คู่มือพัฒนาซอฟต์แวร์',
      name_en: 'Software Development',
      description_th: 'หมวดหมู่เกี่ยวกับการเขียนโปรแกรม',
      description_en: 'Category for programming guides'
    };
    const res = await request(app).post('/api/categories').send(newCat);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name_th).toBe(newCat.name_th);
    createdCategoryId = res.body.data.id;
  });

  test('POST /api/items - should create a new item in category', async () => {
    const newItem = {
      title_th: 'การตั้งค่า Node.js',
      title_en: 'Setting up Node.js',
      description_th: 'ขั้นตอนการติดตั้งและตั้งค่า',
      description_en: 'Installation and setup steps',
      content_th: 'ใช้คำสั่ง npm init และติดตั้ง express',
      content_en: 'Run npm init and install express',
      category_id: createdCategoryId,
      tags: 'nodejs, express, setup'
    };
    const res = await request(app).post('/api/items').send(newItem);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title_th).toBe(newItem.title_th);
    createdItemId = res.body.data.id;
  });

  test('GET /api/items - should filter items by search keyword', async () => {
    const res = await request(app).get('/api/items?search=Node.js');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(createdItemId);
  });

  test('GET /api/dashboard - should return valid metrics', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalItems).toBeGreaterThan(0);
    expect(res.body.data.totalCategories).toBeGreaterThan(0);
  });

  test('GET /api/data/export - should export JSON backup', async () => {
    const res = await request(app).get('/api/data/export');
    expect(res.statusCode).toEqual(200);
    expect(res.body.categories).toBeDefined();
    expect(res.body.items).toBeDefined();
  });
});
