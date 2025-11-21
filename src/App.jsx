// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import Navbar from "./topnavigation/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MeshContext,MeshProvider } from "./store/MeshContext";
import "./App.css";                   
import SideNav from "./sidenavbar/SideNav";
import Cart from "./pages/cart/Cart";
import Wishlist from "./pages/wishlist/WishList";
import Profile from "./pages/user/Profile";
import Orders from "./pages/user/Orders";
import BecomeSeller from "./pages/user/BecomeSeller";
import OrderDetail from "./pages/user/OrderDetails";
const Home = lazy(() => import("./pages/landing/Home"));
const AuthForm = lazy(() => import("./shared/components/Form"));
const Catalog = lazy(() => import("./modules/catalog/CatalogApp"));
const Dashboard = lazy(() => import("./modules/dashboard/DashboardApp"));
const Inventory = lazy(() => import("./modules/inventory/InventoryApp"));

const PageLoader = () => <div style={{ padding: 20 }}>Loading…</div>;

function ProtectedLayout() {
  const { user } = React.useContext(MeshContext);
  const location = useLocation();

  if (!user) return <Navigate to="/auth" replace />;

  // show sidenav on everything EXCEPT home
  const showSideNav = location.pathname !== "/";

  return (
    <div className={`appLayout ${showSideNav ? "withSideNav" : ""}`}>
      {showSideNav && <SideNav />}

      <main className="appContent">
        <Outlet />
      </main>
    </div>
  );
}

function AuthRedirect() {
  const { user } = React.useContext(MeshContext);
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <MeshProvider>
      <Router>
        <Navbar />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AuthRedirect />}>
              <Route path="/auth" element={<AuthForm />} />
            </Route>

            <Route element={<ProtectedLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cart" element={<Cart/>}/>
              <Route path="wishlist"element={<Wishlist/>}/>
              <Route path="profile" element={<Profile/>}/>
              <Route path="orders" element={<Orders/>}/>
              <Route path="become-seller" element={<BecomeSeller/>}/>
              <Route path="orders/:id" element={<OrderDetail/>}/>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </MeshProvider>
  );
}
