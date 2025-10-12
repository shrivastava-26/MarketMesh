import React, { use, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.scss";
import TopNavService from "./topNav.service";
import { CircleUserRound } from "lucide-react";
import UserDrawer from "../shared/components/UserDrawrer";
import AuthService from "../service/auth.service";
import { toast } from "react-toastify";
import { MeshContext } from "../store/MeshContext";

const Navbar = () => {
  const [navItems, setNavItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, setUser } = useContext(MeshContext);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const data = await TopNavService.getNavbarItems();
        setNavItems(data.filter((item) => item.visible));
      } catch (err) {
        console.error("Failed to fetch nav items:", err);
      }
    };
    fetchNavItems();
  }, []);

  const drawerHandler = () => setDrawerOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await AuthService.logout(); // clears cookie from server
      setUser(null); // updates frontend state
      toast.success("Logged out successfully!");
      setDrawerOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {user ? (
          <>
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`navbar-item ${item.active ? "active" : ""}`}
              >
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
            <CircleUserRound
              size={28}
              color="#fff"
              style={{ cursor: "pointer" }}
              onClick={drawerHandler}
            />
          </>
        ) : (
          <div
            style={{
              position: "fixed", // stays at the top
              top: 0,
              left: '5px',
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start", // top-left alignment
              justifyContent: "center",
              padding: "10px 20px",
              backgroundColor: "#1f1f1f",
              height: "60px",
              width: "100%",
              zIndex: 1000,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                color: "#00d1b2", // brand color
              }}
            >
              MarketMesh
            </h1>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "#ffffffaa", // slightly faded for description
                marginTop: "2px",
              }}
            >
              Powering Scalable Multi-Tenant Marketplaces
            </span>
          </div>
        )}
      </ul>

      {drawerOpen && (
        <UserDrawer
          onClose={drawerHandler}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
};

export default Navbar;
