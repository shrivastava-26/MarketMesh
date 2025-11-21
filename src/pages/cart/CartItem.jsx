// src/cart/CartItem.jsx
import React, { useContext } from "react";
import styles from "./cart.module.scss";
import { MeshContext } from "../../store/MeshContext";

const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='18'>No image</text></svg>`
  );

const CartItem = ({ item }) => {
  const { updateQty, removeFromCart, addToWishlist, wishlistCount } = useContext(MeshContext);
  const { product, qty } = item;

  const src = product?.thumbnail || product?.image || product?.images?.[0] || PLACEHOLDER;
  const onImgError = (e) => { if (e?.target) e.target.src = PLACEHOLDER; };

  const handleMoveToWishlist = () => {
    addToWishlist(product);
    removeFromCart(product.id);
    // give immediate feedback with updated count (since state update is async, calculate best-effort)
    const newCount = wishlistCount + (wishlistCount && wishlistCount > 0 && product && wishlistCount ? 0 : 1);
    // above line is conservative; better to show toast after rerender — but quick alert is fine
    // to be accurate, read wishlist from context after state update (requires useEffect in parent).
    alert("Moved to wishlist");
  };

  return (
    <div className={styles.cartItem}>
      <div className={styles.thumbWrap}>
        <img src={src} alt={product?.title || "product"} className={styles.thumb} onError={onImgError} loading="lazy" />
      </div>

      <div className={styles.details}>
        <h4 className={styles.title}>{product?.title || "Untitled product"}</h4>
        <p className={styles.meta}>
          {product?.brand || "Unknown brand"} • {product?.category || "Uncategorized"}
        </p>

        <div className={styles.row}>
          <div className={styles.qty}>
            <button onClick={() => updateQty(product.id, qty - 1)}>-</button>
            <span>{qty}</span>
            <button onClick={() => updateQty(product.id, qty + 1)}>+</button>
          </div>
          <div className={styles.price}>₹{((product?.price || 0) * qty).toFixed(2)}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.link} onClick={() => removeFromCart(product.id)}>
            Remove
          </button>

          <button className={styles.link} onClick={handleMoveToWishlist}>
            Move to wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
