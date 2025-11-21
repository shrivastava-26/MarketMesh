// NavCartIcon.jsx
import React, { useContext } from "react";
import { MeshContext } from "../store/MeshContext";
import styles from "./navCartIcon.module.scss"; // create simple styles

const NavCartIcon = () => {
  const { cartCount } = useContext(MeshContext);
  return (
    <div className={styles.cartIconWrap}>
      <button aria-label="Open cart" className={styles.iconBtn}>
        🛒
        {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
      </button>
    </div>
  );
};

export default NavCartIcon;
