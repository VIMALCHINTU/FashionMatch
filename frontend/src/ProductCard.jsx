function ProductCard({ product }) {
  return (
    <div className="recommended-product-card">

      <img
        className="product-image"
        src={product.image}
        alt={product.name}
      />

      <div className="product-details">

        <p className="product-platform">
          {product.platform}
        </p>

        <h3>
          {product.name}
        </h3>

        <p className="product-price">
          ₹{product.price}
        </p>

      </div>

      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="product-link"
      >
        View
      </a>

    </div>
  );
}

export default ProductCard;