// src/sidenavbar/SideNav.jsx
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  ListCollapse,
  Boxes,
  ShoppingCart,
  Filter,
  ArrowUpDown,
  Heart,
  PlusCircle,
  AlertTriangle,
  Download,
  Upload,
  FileBarChart,
  Settings,
  LayoutDashboard,
  Home as HomeIcon,
} from "lucide-react";
import styles from "./sideNav.module.scss";
import { MeshContext } from "../store/MeshContext";

const TAB_CONFIG = {
  home: { label: "Home", icon: HomeIcon, actions: [] },
  catalog: {
    label: "Catalog",
    icon: Boxes,
    actions: [
      { key: "cart", label: "Cart", icon: ShoppingCart, to: "/cart" },
      { key: "filter", label: "Filter", icon: Filter },
      { key: "sort", label: "Sort", icon: ArrowUpDown },
      { key: "wish", label: "Wish", icon: Heart, to: "/wishlist" },
    ],
  },
  inventory: {
    label: "Inventory",
    icon: Boxes,
    actions: [
      { key: "add", label: "Add", icon: PlusCircle },
      { key: "stock", label: "Stock", icon: AlertTriangle },
      { key: "import", label: "Import", icon: Download },
      { key: "export", label: "Export", icon: Upload },
    ],
  },
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    actions: [
      { key: "view", label: "view", icon: LayoutDashboard },
      { key: "report", label: "Report", icon: FileBarChart },
      { key: "setting", label: "Setting", icon: Settings },
    ],
  },
};

const SideNav = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const firstSegment = pathname.split("/")[1] || "home";
  const currentKey = ["catalog", "inventory", "dashboard"].includes(firstSegment) ? firstSegment : "home";
  const config = TAB_CONFIG[currentKey];

  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed((p) => !p);

  const { cartCount, wishlistCount } = useContext(MeshContext);
  const navigate = useNavigate();

  const handleActionClick = (action, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (action.to) {
      navigate(action.to);
      return;
    }

    if (action.key === "cart") {
      navigate("/cart");
      return;
    }

    if (action.key === "wish") {
      navigate("/wish");
      return;
    }
  };

  return (
    <aside className={`${styles.sideNav} ${collapsed ? styles.sideNavCollapsed : ""}`} aria-hidden={false}>
      <button
        type="button"
        className={styles.hamburger}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <Menu size={18} /> : <ListCollapse size={18} />}
      </button>

      {/* header (visible only when expanded) */}
      {!collapsed && (
        <div className={styles.sideNavHeader}>
          {config.icon && <config.icon size={18} className={styles.tabIcon} />}
          <h2 className={styles.currentTabTitle}>{config.label}</h2>
        </div>
      )}

      {/* EXPANDED actions */}
      {!collapsed && (
        <div className={styles.actionsSection}>
          {config.actions.map((act) => {
            const isCart = act.key === "cart";
            const isWish = act.key === "wish"
            return (
              <button
                key={act.key || act.label}
                type="button"
                className={styles.actionChip}
                onClick={(e) => handleActionClick(act, e)}
                aria-label={act.label}
              >
                <span
                  className={styles.actionIconWrap}
                  {...(isCart ? { "data-count": String(cartCount) } : {})}
                  {...(isWish ? { "data-count": String(wishlistCount) } : {})}
                >
                  {act.icon && <act.icon size={16} />}
                </span>
                <span className={styles.actionLabel}>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* COLLAPSED icons column */}
      {collapsed && (
        <div className={styles.collapsedIcons}>
          {config.actions.map((act) => {
            const isCart = act.key === "cart";
            const isWish = act.key === "wish" || act.key === "wishlist";
            return (
              <button
                key={act.key || act.label}
                type="button"
                className={styles.collapsedIconBtn}
                onClick={(e) => handleActionClick(act, e)}
                aria-label={act.label}
                title={act.label}
              >
                <span
                  className={styles.collapsedIconWrap}
                  {...(isCart ? { "data-count": String(cartCount) } : {})}
                  {...(isWish ? { "data-count": String(wishlistCount) } : {})}
                >
                  {act.icon && <act.icon size={18} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default SideNav;
