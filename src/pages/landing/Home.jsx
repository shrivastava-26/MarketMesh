import React, { useContext } from "react";
import "./home.scss";
import { ShoppingCart, Users, Database, BarChart2 } from "lucide-react";
import { features } from "./constant";
import { MeshContext } from "../../store/MeshContext";

const Home = () => {
  const { user } = useContext(MeshContext);

  return (
    <div className="marketmesh">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Powering Scalable <span>Multi-Tenant Marketplaces</span>
          </h1>
          <p>
            MarketMesh helps businesses manage products, inventory, orders, and
            payments — all in one secure and scalable platform.
          </p>

          {/* Personalized Greeting */}
          {user && (
            <div
              style={{
                padding: "20px 30px",
                borderRadius: "15px",
                display: "inline-block",
                boxShadow: "8px 10px 30px 18px rgba(0,0,0,0.1)",
                animation: "fadeInUp 1s ease forwards",
                marginTop: "20px",
                height:'60px',

              }}
            >
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color:'offwhite',
                  margin: 0,
                }}
              >
                Welcome back,{" "}
                <span style={{ color: "#4f46e5" }}>
                  {(user?.name ?? user?.email ?? "User")
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </span>
                !
              </p>
              <p style={{ fontSize: "1rem", color:'black', marginTop: "5px" }}>
                Ready to elevate your marketplace today? 🚀
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Business Features</h2>
        <div className="feature-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="feature-card">
                <div className="icon">
                  <Icon size={32} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <h2>Optimize Your Marketplace Operations</h2>
        <p>
          Use MarketMesh to streamline product management, inventory tracking,
          order fulfillment, and data analytics — all in one platform.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} MarketMesh. All Rights Reserved.</p>
        <div className="links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
