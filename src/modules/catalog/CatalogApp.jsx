import React from "react";
import styles from "./catalog.module.scss";

const CatalogApp = () => {
  return (
    <div className={styles.catalogContainer}>
      <h3 className={styles.catalogTitle}>Catalog</h3>
      <p>Welcome to the Catalog microfrontend.</p>
      {/* Add more content here */}
    </div>
  );
};

export default CatalogApp;
