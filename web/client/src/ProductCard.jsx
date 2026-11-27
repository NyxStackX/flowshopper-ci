// One product of the catalog, as drawn in docs/mockups/01-home-desktop.png.
const TINTS = {
  Bakery: 'peach', 'Dairy & Eggs': 'sky', 'Fruits & Vegetables': 'mint', Frozen: 'lilac',
};

function shortName(product) {
  // The CSV repeats the brand at the start of the name: show it once, above.
  return product.name.startsWith(product.brand)
    ? product.name.slice(product.brand.length).trim()
    : product.name;
}

export default function ProductCard({ product }) {
  const tint = TINTS[product.subcategory] || 'neutral';
  return (
    <article className="card">
      <div className={`card__image card__image--${tint}`}>
        <span>{product.subcategory}</span>
      </div>
      <p className="card__brand">{product.brand}</p>
      <h3 className="card__name">{shortName(product)}</h3>
      <div className="card__footer">
        <div>
          <span className="card__price">{product.price_bells} bells</span>
          <span className="card__unit">
            {product.unit_price_bells} bells {product.unit_price_basis}
          </span>
        </div>
        {product.in_stock ? (
          <button type="button" className="button" aria-label={`Add ${product.name} to cart`}>
            Add
          </button>
        ) : (
          <span className="card__out">Out of stock</span>
        )}
      </div>
    </article>
  );
}
