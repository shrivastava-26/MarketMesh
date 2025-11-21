// ProductCard.jsx
import React, { useContext } from "react";
import styles from "./productCard.module.scss";
import { MeshContext } from "../../store/MeshContext";
const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    title,
    brand,
    category,
    price,
    discountPercentage,
    rating,
    thumbnail,
  } = product;

  const { addToCart } = useContext(MeshContext);

  const handleAdd = () => {
    addToCart(product, 1);
    // optional: simple visual feedback
    // you can replace with toasts
    // alert(`${title} added to cart`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={thumbnail}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.info}>
        <p className={styles.meta}>
          {brand && <span>{brand}</span>}
          {brand && category && <span className={styles.dot}>•</span>}
          {category && <span className={styles.category}>{category}</span>}
        </p>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{price}</span>
          {discountPercentage && (
            <span className={styles.discount}>
              {Math.round(discountPercentage)}% off
            </span>
          )}
        </div>

        {rating && <p className={styles.rating}>⭐ {rating.toFixed(1)}</p>}

        <button className={styles.cartBtn} onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
