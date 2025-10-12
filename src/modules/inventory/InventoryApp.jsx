import React from "react";
import styles from "./inventory.module.scss";

const InventoryApp = () => {
  return (
    <div className={styles.inventoryContainer}>
      <h2 className={styles.inventoryTitle}>Inventory</h2>
      <p>Welcome to the Inventory microfrontend.</p>
      {/* Add inventory content here */}
    </div>
  );
};

export default InventoryApp;
