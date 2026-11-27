import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from './api.js';
import ProductCard from './ProductCard.jsx';

export default function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [aisle, setAisle] = useState('All');

  useEffect(() => {
    fetchProducts()
      .then((items) => { setProducts(items); setStatus('ready'); })
      .catch((err) => { setError(err.message); setStatus('error'); });
  }, []);

  const aisles = useMemo(
    () => ['All', ...new Set(products.map((product) => product.subcategory))],
    [products],
  );
  const shown = aisle === 'All' ? products : products.filter((p) => p.subcategory === aisle);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <a href="/" className="logo">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
              <rect width="30" height="30" rx="8" fill="#5B2FD6" />
              <path d="M9 20V10h11M9 15h8" fill="none" stroke="#FFFFFF" strokeWidth="2.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            flowshopper
          </a>
        </div>
      </header>

      <main className="main">
        <h1 className="title">All products</h1>

        {status === 'ready' && (
          <nav aria-label="Aisles" className="aisles">
            {aisles.map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={aisle === name}
                onClick={() => setAisle(name)}
              >
                {name}
              </button>
            ))}
          </nav>
        )}

        {status === 'loading' && <p role="status">Loading the catalog...</p>}
        {status === 'error' && (
          <p role="alert" className="alert">The catalog could not be loaded. {error}</p>
        )}

        {status === 'ready' && (
          <>
            <p className="count" role="status">{shown.length} products</p>
            <div className="grid">
              {shown.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </main>
    </>
  );
}
