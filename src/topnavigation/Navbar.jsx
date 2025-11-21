// src/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.scss";
import TopNavService from "./topNav.service";
import { CircleUserRound } from "lucide-react";
import UserDrawer from '../shared/components/UserDrawrer'
import AuthService from "../service/auth.service";
import { toast } from "react-toastify";
import { MeshContext } from "../store/MeshContext";

const Navbar = () => {
  const [navItems, setNavItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser } = useContext(MeshContext);

  const location = useLocation();
  const currentPath = location.pathname || "/";

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const data = await TopNavService.getNavbarItems();
        // ensure data is an array and has path property
        setNavItems(Array.isArray(data) ? data.filter((item) => item.visible) : []);
      } catch (err) {
        console.error("Failed to fetch nav items:", err);
      }
    };
    fetchNavItems();
  }, []);

  const drawerHandler = () => setDrawerOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      toast.success("Logged out successfully!");
      setDrawerOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Logout failed");
    }
  };

  // Reliable active check
  const isActive = (itemPath = "/") => {
    if (!itemPath) return false;
    // exact match for root
    if (itemPath === "/") return currentPath === "/";
    // exact match for exact paths
    if (currentPath === itemPath) return true;
    // prefix match (e.g. /orders should be active for /orders/123)
    return currentPath.startsWith(itemPath);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-brand">
        <Link to="/" className="brand-link" aria-label="MarketMesh Home">
          <span className="brand-title">MarketMesh</span>
          <span className="brand-subtitle">Powering Scalable Multi-Tenant Marketplaces</span>
        </Link>
      </div>

      {user && (
        <div className="navbar-right" role="region" aria-label="User navigation">
          <ul className="navbar-list" role="menubar" aria-hidden={navItems.length === 0}>
            {navItems.map((item) => (
              <li
                key={item.id}
                role="none"
                className={`navbar-item ${isActive(item.path) ? "active" : ""}`}
              >
                <Link role="menuitem" to={item.path}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <button
            className="user-icon-btn"
            onClick={drawerHandler}
            aria-expanded={drawerOpen}
            aria-label="Open account drawer"
            title="Account"
          >
            <CircleUserRound size={28} />
          </button>
        </div>
      )}

      {drawerOpen && (
        <UserDrawer onClose={drawerHandler} onLogout={handleLogout} />
      )}
    </nav>
  );
};

export default Navbar;
