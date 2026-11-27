// Store API. Kept apart from index.js so tests can start it without a port.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

function sendError(res, status, code, message) {
  res.status(status).json({ error: { code, message } });
}

export function createApp({ catalog, clientDist }) {
  const app = express();
  const byId = new Map(catalog.map((product) => [product.id, product]));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', products: catalog.length });
  });

  // GET /api/products?category=Food&subcategory=Bakery
  app.get('/api/products', (req, res) => {
    const { category, subcategory } = req.query;
    const items = catalog.filter((product) =>
      (!category || product.category === category) &&
      (!subcategory || product.subcategory === subcategory));
    res.json({ count: items.length, items });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = byId.get(req.params.id);
    if (!product) return sendError(res, 404, 'unknown_product', `No product with id ${req.params.id}.`);
    res.json(product);
  });

  app.use('/api', (_req, res) => sendError(res, 404, 'unknown_route', 'This API route does not exist.'));

  // In production, the built React app is served by the same server.
  if (clientDist && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  return app;
}
