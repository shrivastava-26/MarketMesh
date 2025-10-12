import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./topnavigation/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MeshProvider, MeshContext } from "./store/MeshContext";

const Home = lazy(() => import("./pages/landing/Home"));
const Form = lazy(() => import("./shared/components/Form"));
const Catalog = lazy(() => import("./modules/catalog/CatalogApp"));
const Inventory = lazy(() => import("./modules/inventory/InventoryApp"));
const Dashboard = lazy(() => import("./modules/dashboard/DashboardApp"));

// Protect any route for logged-in users only
const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(MeshContext);
  return user ? children : <Navigate to="/auth" replace />;
};

const AuthRedirect = ({ children }) => {
  const { user } = React.useContext(MeshContext);
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Home page */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Auth Form */}
      <Route
        path="/auth"
        element={
          <AuthRedirect>
            <Form />
          </AuthRedirect>
        }
      />

      {/* Protected modules */}
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

const App = () => {
  return (
    <MeshProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </MeshProvider>
  );
};

export default App;
