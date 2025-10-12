import React from "react";
import styles from "./userDrawer.module.scss";
import { cards } from "./constants/userDrawer";

const UserDrawer = ({ onClose, user, onLogout }) => {
  const handleChipClick = (card) => {
    alert(`Clicked on ${card.title}`);
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h3>Settings</h3>
        {user && (
          <div className={styles.profile}>
            <p style={{ color: "black" }}>
              {(user?.name ?? user?.email ?? "User")
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
            </p>
            <button className={styles.logoutBtn} onClick={onLogout}>
              Logout
            </button>
          </div>
        )}

        <div className={styles.chipContainer}>
          {cards.map((card) => (
            <button
              key={card.id}
              className={styles.chip}
              onClick={() => handleChipClick(card)}
              disabled={user?.role !== "admin"}
            >
              {card.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDrawer;
