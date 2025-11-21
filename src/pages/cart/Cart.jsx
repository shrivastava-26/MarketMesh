// src/cart/Cart.jsx
import React, { useContext, useState } from "react";
import styles from "./cart.module.scss";
import { MeshContext } from "../../store/MeshContext";
import CartItem from "./CartItem";
import CheckoutModel from "./CheckoutModel";

const Cart = () => {
  const {
    cart,
    subtotal,
    coupon,
    setCouponCode,
    couponDiscount,
    shipping,
    total,
    pincode,
    setDeliveryPincode,
    clearCart,
  } = useContext(MeshContext);

  const [pinInput, setPinInput] = useState(pincode || "");
  const [couponInput, setCouponInput] = useState(coupon ? coupon.code : "");
  const [showCheckout, setShowCheckout] = useState(false);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponCode(null);
      return alert("Enter coupon code");
    }
    if (code === "SAVE10") {
      setCouponCode({ code, type: "percent", value: 10 });
      return alert("Applied SAVE10 (10% off)");
    }
    if (code === "FLAT50") {
      setCouponCode({ code, type: "flat", value: 50 });
      return alert("Applied FLAT50 (₹50 off)");
    }
    alert("Invalid coupon");
  };

  const applyPincode = () => {
    setDeliveryPincode(pinInput);
    alert(`Delivery pincode set to ${pinInput}`);
  };

  const handlePlaceOrder = () => {
    if (!cart.length) return alert("Cart is empty");
    setShowCheckout(true);
  };

  return (
    <div className={styles.container}>
      <h2>My Cart</h2>
      <div className={styles.grid}>
        <div className={styles.left}>
          {cart.length === 0 && <p>Your cart is empty</p>}
          {cart.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        <aside className={styles.right}>
          <div className={styles.section}>
            <h3>Delivery Pincode</h3>
            <div className={styles.row}>
              <input
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter pincode"
              />
              <button onClick={applyPincode}>Apply</button>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Have a coupon?</h3>
            <div className={styles.row}>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
              />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {coupon && (
              <div className={styles.couponInfo}>
                Applied: {coupon.code} —{" "}
                {coupon.type === "percent" ? `${coupon.value}%` : `₹${coupon.value}`}
                <button onClick={() => setCouponCode(null)} className={styles.clearBtn}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Price Details</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Coupon Discount</span>
              <span>- ₹{couponDiscount.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <strong>Total</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            <button className={styles.placeBtn} onClick={handlePlaceOrder}>
              Place Order
            </button>
            <button
              className={styles.clearBtn}
              onClick={() => {
                if (confirm("Clear cart?")) clearCart();
              }}
            >
              Clear Cart
            </button>
          </div>
        </aside>
      </div>

      {showCheckout && (
        <CheckoutModel
          onClose={() => setShowCheckout(false)}
          subtotal={subtotal}
          couponDiscount={couponDiscount}
          shipping={shipping}
          total={total}
        />
      )}
    </div>
  );
};

export default Cart;
