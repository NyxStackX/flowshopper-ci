// Catalog: read once from the provided CSV file, then kept in memory.
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';

const NUMBER_FIELDS = [
  'size', 'price_bells', 'unit_price_bells', 'stock', 'energy_kcal', 'fat_g',
  'saturated_fat_g', 'sugars_g', 'salt_g', 'protein_g', 'fiber_g',
];

function splitList(value) {
  return value ? value.split('|').map((item) => item.trim()).filter(Boolean) : [];
}

// An empty allergen field means "unknown", never "no allergen" (see DECISIONS.md).
export function toProduct(row) {
  const product = { ...row };
  for (const field of NUMBER_FIELDS) {
    product[field] = row[field] === '' ? null : Number(row[field]);
  }
  product.labels = splitList(row.labels);
  product.allergens = row.allergens ? splitList(row.allergens) : null;
  product.nutriscore = row.nutriscore || null;
  product.in_stock = product.stock > 0;
  return product;
}

export function loadCatalog(csvPath) {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Catalog file not found: ${csvPath}. Set CATALOG_PATH in .env.`);
  }
  const rows = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
  return rows.map(toProduct);
}
