// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import ProductCard from '../../../client/src/ProductCard.jsx';
import App from '../../../client/src/App.jsx';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const product = {
  id: 'FS-0001', name: 'Coral Bay Gourmet Baguette 1 piece', brand: 'Coral Bay Gourmet',
  subcategory: 'Bakery', price_bells: 173, unit_price_bells: 173, unit_price_basis: 'per piece', in_stock: true,
};

describe('ProductCard', () => {
  it('shows the brand once, the short name and the price', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole('heading', { name: 'Baguette 1 piece' })).toBeTruthy();
    expect(screen.getByText('173 bells')).toBeTruthy();
  });

  it('gives the add button a name a screen reader can read', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole('button', { name: 'Add Coral Bay Gourmet Baguette 1 piece to cart' })).toBeTruthy();
  });

  it('replaces the button when the product is out of stock', () => {
    render(<ProductCard product={{ ...product, in_stock: false }} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Out of stock')).toBeTruthy();
  });
});

describe('App', () => {
  it('shows the catalog returned by the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ items: [product] }) });
    render(<App />);
    await waitFor(() => expect(screen.getByText('1 products')).toBeTruthy());
  });

  it('tells the villager when the catalog cannot be loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false, status: 500, json: async () => ({ error: { message: 'Server down.' } }),
    });
    render(<App />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Server down.'));
  });
});
