import React, { useContext } from "react";
import styles from "./wishlist.module.scss";
import { useNavigate } from "react-router-dom";
import { MeshContext } from "../../store/MeshContext";

const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='18'>No image</text></svg>`
  );

const Wishlist = () => {
  const { wishlist, removeFromWishlist, moveWishlistToCart } = useContext(MeshContext);
  const navigate = useNavigate();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyCard}>
          <h2>Your Wishlist is empty</h2>
          <p>Save your favorite items and add them to cart later.</p>
          <button className={styles.cta} onClick={() => navigate("/catalog")}>Browse Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wishlist</h1>
        <div className={styles.meta}>{wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved</div>
      </div>

      <div className={styles.grid}>
        {wishlist.map((p) => {
          const src = p?.thumbnail || p?.image || p?.images?.[0] || PLACEHOLDER;
          return (
            <article key={p.id} className={styles.card} aria-label={p.title}>
              <div className={styles.imageWrap}>
                <img
                  src={src}
                  alt={p.title || "product"}
                  className={styles.image}
                  onError={(e) => (e.target.src = PLACEHOLDER)}
                  loading="lazy"
                />
              </div>

              <div className={styles.body}>
                <div className={styles.rowTop}>
                  <h3 className={styles.productTitle}>{p.title}</h3>
                  {p.discountPercentage ? (
                    <span className={styles.badge}>{Math.round(p.discountPercentage)}% OFF</span>
                  ) : null}
                </div>

                <div className={styles.sub}>{p.brand || "Unknown brand"} · {p.category || "Category"}</div>

                <div className={styles.priceRow}>
                  <div className={styles.price}>₹{(p.price || 0).toFixed(0)}</div>
                  {p.mrp && p.mrp > p.price && <div className={styles.mrp}>₹{p.mrp}</div>}
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    onClick={() => {
                      moveWishlistToCart(p, 1);
                    }}
                  >
                    Add to Cart
                  </button>

                  <button
                    className={styles.ghost}
                    onClick={() => removeFromWishlist(p.id)}
                    aria-label={`Remove ${p.title} from wishlist`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
