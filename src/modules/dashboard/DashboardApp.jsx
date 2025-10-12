import React from "react";
import styles from "./dashboard.module.scss";

const DashboardApp = () => {
  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Dashboard</h2>
      <p>Welcome to the Dashboard microfrontend.</p>
      {/* Add more dashboard content here */}
    </div>
  );
};

export default DashboardApp;
