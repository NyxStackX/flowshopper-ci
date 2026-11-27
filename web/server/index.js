// Web server entry point: loads the catalog, then serves the store API on SITE_PORT.
// Coming in later steps: auth, Stripe webhook, WebSocket, recommendation proxy with fallback.
import { config } from './config.js';
import { loadCatalog } from './catalog.js';
import { createApp } from './app.js';

let catalog;
try {
  catalog = loadCatalog(config.catalogPath);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

createApp({ catalog, clientDist: config.clientDist }).listen(config.sitePort, () => {
  console.log(`Flowshopper web server on http://localhost:${config.sitePort} (${catalog.length} products)`);
});
