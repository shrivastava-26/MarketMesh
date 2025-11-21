// src/store/MeshContext.jsx
import React, { createContext, useState, useEffect } from "react";

const MeshContext = createContext();
const STORAGE_KEY = "mesh_cart_v1"; // keep backward compatible

const MeshProvider = ({ children }) => {
  const [navItems, setNavItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(null);
  const [active, setActive] = useState(false);

  // cart/wishlist/orders
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  const [coupon, setCoupon] = useState(null);
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(parsed.cart || []);
        setWishlist(parsed.wishlist || []);
        setOrders(parsed.orders || []);
        setCoupon(parsed.coupon || null);
        setPincode(parsed.pincode || "");
      }
    } catch (e) {
      console.warn("Failed to parse storage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist, orders, coupon, pincode }));
  }, [cart, wishlist, orders, coupon, pincode]);

  /* ---------- cart API ---------- */
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.product.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { product, qty }];
    });
  };

  const removeFromCart = (productId) => setCart((prev) => prev.filter((c) => c.product.id !== productId));

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((c) => (c.product.id === productId ? { ...c, qty } : c)));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setPincode("");
  };

  /* ---------- wishlist API ---------- */
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId) => setWishlist((prev) => prev.filter((p) => p.id !== productId));

  const moveWishlistToCart = (product, qty = 1) => {
    addToCart(product, qty);
    removeFromWishlist(product.id);
  };

  /* ---------- orders API ---------- */
  // order shape: { id, items: [{product, qty}], subtotal, coupon, shipping, total, pincode, address, status, createdAt }
  const addOrder = (order) => {
    setOrders((prev) => [{ ...order, id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), status: "Processing" }, ...prev]);
    // clear cart after order
    setCart([]);
    setCoupon(null);
    setPincode("");
  };

  const removeOrder = (orderId) => setOrders((prev) => prev.filter((o) => o.id !== orderId));

  /* ---------- misc ---------- */
  const setCouponCode = (c) => setCoupon(c);
  const setDeliveryPincode = (pin) => setPincode(pin);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const wishlistCount = wishlist.length;
  const ordersCount = orders.length;

  const subtotal = cart.reduce((s, it) => s + (it.product.price || 0) * it.qty, 0);

  const couponDiscount = (() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") return +(subtotal * (coupon.value / 100));
    if (coupon.type === "flat") return +coupon.value;
    return 0;
  })();

  const shipping = subtotal > 499 ? 0 : subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - couponDiscount + shipping);

  return (
    <MeshContext.Provider
      value={{
        navItems,
        setNavItems,
        user,
        setUser,
        loading,
        currentTab,
        setCurrentTab,
        active,
        setActive,

        // cart
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        subtotal,
        coupon,
        setCouponCode,
        couponDiscount,
        shipping,
        total,
        pincode,
        setDeliveryPincode,

        // wishlist
        wishlist,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        moveWishlistToCart,

        // orders
        orders,
        ordersCount,
        addOrder,
        removeOrder,
      }}
    >
      {children}
    </MeshContext.Provider>
  );
};

export { MeshContext, MeshProvider };
