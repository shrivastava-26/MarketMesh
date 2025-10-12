import React from "react";
import styles from "./user.module.scss";

const User = () => {
  return (
    <div className={styles.userContainer}>
      <h2 className={styles.userTitle}>User</h2>
      <p>Welcome to the User microfrontend.</p>
      {/* Add user content here */}
    </div>
  );
};

export default User;
