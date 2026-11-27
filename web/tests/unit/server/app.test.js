import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../server/app.js';

const catalog = [
  { id: 'FS-0001', name: 'Baguette', category: 'Food', subcategory: 'Bakery' },
  { id: 'FS-0002', name: 'Frozen peas', category: 'Food', subcategory: 'Frozen' },
  { id: 'FS-0003', name: 'Soap', category: 'Household', subcategory: 'Cleaning' },
];
const app = createApp({ catalog });

describe('store API', () => {
  it('answers on /api/health with the number of products', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', products: 3 });
  });

  it('lists every product', async () => {
    const response = await request(app).get('/api/products');
    expect(response.body.count).toBe(3);
  });

  it('filters by category and aisle', async () => {
    const food = await request(app).get('/api/products?category=Food');
    expect(food.body.count).toBe(2);
    const frozen = await request(app).get('/api/products?subcategory=Frozen');
    expect(frozen.body.items.map((p) => p.id)).toEqual(['FS-0002']);
  });

  it('returns one product by id', async () => {
    const response = await request(app).get('/api/products/FS-0003');
    expect(response.body.name).toBe('Soap');
  });

  it('gives an explicit error for an unknown product', async () => {
    const response = await request(app).get('/api/products/FS-9999');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('unknown_product');
  });

  it('gives an explicit error for an unknown API route', async () => {
    const response = await request(app).get('/api/nothing');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('unknown_route');
  });
});
