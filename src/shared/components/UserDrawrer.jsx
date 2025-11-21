// src/components/userDrawer/UserDrawer.jsx
import React, { useContext } from "react";
import styles from "./userDrawer.module.scss";
import { MeshContext } from "../../store/MeshContext";
import { useNavigate } from "react-router-dom";
import { PanelTopClose } from "lucide-react";
import { toast } from "react-toastify";

const UserDrawer = ({ onClose }) => {
  const { user, setUser, ordersCount, wishlistCount } = useContext(MeshContext);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    toast("logout successfully")
    setUser(null);
    onClose?.();
    navigate("/auth");
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>{<PanelTopClose />}</button>

        <div className={styles.profile}>
          <div className={styles.avatar}>{(user?.name || user?.email || "U").charAt(0).toUpperCase()}</div>
          <div>
            <div className={styles.name}>{user?.name ?? user?.email ?? "Guest User"}</div>
            <div className={styles.email}>{user?.email ?? "Not signed in"}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.item} onClick={() => handleNavigate("/profile")}>Profile</button>
          <button className={styles.item} onClick={() => handleNavigate("/orders")}>
            Orders <span className={styles.count}>{ordersCount}</span>
          </button>
          <button className={styles.item} onClick={() => handleNavigate("/become-seller")}>Become a seller</button>
          <button className={styles.item} onClick={() => handleNavigate("/wishlist")}>
            Wishlist <span className={styles.count}>{wishlistCount}</span>
          </button>
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </div>
  );
};

export default UserDrawer;
