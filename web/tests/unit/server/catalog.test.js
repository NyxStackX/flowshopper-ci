import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadCatalog, toProduct } from '../../../server/catalog.js';

const row = {
  id: 'FS-0001', name: 'Coral Bay Gourmet Baguette 1 piece', brand: 'Coral Bay Gourmet',
  category: 'Food', subcategory: 'Bakery', price_bells: '173', unit_price_bells: '173.0',
  size: '1', stock: '59', labels: 'vegan', allergens: 'gluten|milk', nutriscore: 'C',
  energy_kcal: '', fat_g: '', saturated_fat_g: '', sugars_g: '', salt_g: '', protein_g: '', fiber_g: '',
};

describe('toProduct', () => {
  it('turns numbers and lists into real types', () => {
    const product = toProduct(row);
    expect(product.price_bells).toBe(173);
    expect(product.allergens).toEqual(['gluten', 'milk']);
    expect(product.labels).toEqual(['vegan']);
    expect(product.in_stock).toBe(true);
  });

  it('treats an empty allergen field as unknown, never as "no allergen"', () => {
    expect(toProduct({ ...row, allergens: '' }).allergens).toBeNull();
  });

  it('marks a product with no stock as out of stock', () => {
    expect(toProduct({ ...row, stock: '0' }).in_stock).toBe(false);
  });

  it('keeps an empty number as null rather than 0', () => {
    expect(toProduct(row).energy_kcal).toBeNull();
  });
});

describe('loadCatalog', () => {
  it('reads the CSV file', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-')), 'catalog.csv');
    fs.writeFileSync(file, `${Object.keys(row).join(',')}\n${Object.values(row).join(',')}\n`);
    expect(loadCatalog(file)).toHaveLength(1);
  });

  it('fails with a message naming the missing file', () => {
    expect(() => loadCatalog('/no/such/catalog.csv')).toThrow(/Catalog file not found: \/no\/such\/catalog.csv/);
  });
});
