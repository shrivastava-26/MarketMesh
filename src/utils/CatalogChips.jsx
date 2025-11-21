// CatalogChips.jsx
import React from "react";
import styles from "../modules/catalog/catalog.module.scss";

const QUICK_FILTERS = ["All", "Mobiles", "Bikes", "Beauty", "Electronics", "Home"];

const CatalogChips = ({ selectedFilter, onFilterChange }) => {
  return (
    <header className={styles.catalogHeader}>
      {/* <h3 className={styles.catalogTitle}>Catalog</h3> */}

      <div className={styles.chipRow}>
        {QUICK_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`${styles.chip} ${
              selectedFilter === chip ? styles.chipActive : ""
            }`}
            onClick={() => onFilterChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </header>
  );
};

export default CatalogChips;
