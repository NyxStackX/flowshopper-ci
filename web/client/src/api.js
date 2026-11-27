// Calls to the store API. Every failure becomes an Error with a message the page can show.
export async function fetchProducts() {
  const response = await fetch('/api/products');
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || `The store did not answer (HTTP ${response.status}).`);
  }
  return (await response.json()).items;
}
