// utils/Shimmer.jsx
import React from "react";
import styles from "./shimmer.module.scss";

const Shimmer = ({ count = 8 }) => {
  return (
    <div className={styles.shimmerGrid}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.imageWrapper}>
            <div className={`${styles.skeleton} ${styles.imageSkeleton}`} />
          </div>

          <div className={styles.info}>
            <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.metaSkeleton}`} />

            <div className={styles.priceRow}>
              <div className={`${styles.skeleton} ${styles.priceSkeleton}`} />
              <div
                className={`${styles.skeleton} ${styles.discountSkeleton}`}
              />
            </div>

            <div className={`${styles.skeleton} ${styles.ratingSkeleton}`} />

            <div className={`${styles.skeleton} ${styles.cartSkeleton}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Shimmer;
