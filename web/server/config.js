// All configuration comes from environment variables (see ../../.env.example).
// Nothing machine-specific is written in the code.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = path.resolve(webDir, '..');

// The .env file sits at the root of the repository, shared by every part.
dotenv.config({ path: path.join(repoDir, '.env') });

function resolveFromRepo(value, fallback) {
  const chosen = value || fallback;
  return path.isAbsolute(chosen) ? chosen : path.resolve(repoDir, chosen);
}

export const config = {
  sitePort: Number(process.env.SITE_PORT || 3000),
  catalogPath: resolveFromRepo(process.env.CATALOG_PATH, 'reco/data/flowshopper_catalog.csv'),
  clientDist: path.join(webDir, 'dist'),
};
