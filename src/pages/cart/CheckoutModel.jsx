// src/cart/CheckoutModel.jsx
import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import styles from "./checkoutModel.module.scss";
import { MeshContext } from "../../store/MeshContext";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

/**
 * CheckoutModel — frontend
 * - sends full orderPayload to /api/payments/create-order
 * - uses returned localOrderId when calling /api/payments/verify-payment
 * - uses VITE_API_BASE and VITE_RAZORPAY_KEY
 */

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3010";
const API_BASE = import.meta.env.VITE_DEPLOYED_API_BASE_URL;
// const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "<YOUR_RAZORPAY_KEY>";
const RAZORPAY_KEY = "rzp_test_RiS6l05qQdHH0t";

const CheckoutModel = ({
  onClose,
  subtotal = 0,
  couponDiscount = 0,
  shipping = 0,
  total = 0,
}) => {
  const {
    cart,
    pincode: savedPincode,
    addOrder,
    user,
  } = useContext(MeshContext);
  const navigate = useNavigate();

  const [stage, setStage] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("UPI"); // UPI | CARD | COD

  const isAddressValid = () => {
    const { name, phone, addressLine, city, pincode } = address;
    if (
      !name.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !pincode.trim()
    )
      return false;
    if (!/^\d{6}$/.test(pincode.trim())) return false;
    if (!/^\d{10}$/.test(phone.trim())) return false;
    return true;
  };

  const updateField = (k, v) => setAddress((a) => ({ ...a, [k]: v }));

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.head.appendChild(s);
    });

  const handleNext = () => {
    if (stage === 0) {
      if (!isAddressValid()) {
        toast.error(
          "Please complete the address form (10-digit phone, 6-digit pincode)."
        );
        return;
      }
      toast.success("Address saved");
      setStage(1);
      return;
    }
    if (stage === 1) setStage(2);
  };

  const handleBack = () => setStage((s) => Math.max(0, s - 1));

  const handlePlace = async () => {
    if (processing) return;
    setProcessing(true);

    const orderPayload = {
      items: cart.map((it) => ({ product: it.product, qty: it.qty })),
      subtotal,
      couponDiscount,
      shipping,
      total,
      pincode: address.pincode || savedPincode,
      address,
      paymentMethod,
      metadata: { clientTimestamp: Date.now() },
    };

    try {
      // COD flow
      if (paymentMethod === "COD") {
        const localOrder = {
          id: `local_${Date.now()}`,
          items: orderPayload.items,
          subtotal: orderPayload.subtotal,
          couponDiscount: orderPayload.couponDiscount,
          shipping: orderPayload.shipping,
          total: orderPayload.total,
          address: orderPayload.address,
          pincode: orderPayload.pincode,
          paid: false,
          payment: { method: "COD" },
          createdAt: Date.now(),
        };
        addOrder(localOrder); // your MeshContext should persist this
        toast.success("Order placed (Cash on Delivery).");
        onClose?.();
        navigate("/");
        return;
      }

      // Online flow
      await loadRazorpayScript();

      // Create server order + local order (server will create local order if orderPayload passed)
      const createRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerPhone: address.phone || "",
            customerName: address.name || "",
          },
          userId: user?.id || user?._id || null,
          orderPayload,
        }),
      });

      if (!createRes.ok) {
        const body = await createRes.text().catch(() => "");
        throw new Error(
          `Server create-order failed: ${createRes.status} ${
            body || createRes.statusText
          }`
        );
      }

      const createData = await createRes.json();
      const localOrderId = createData.localOrderId || null;

      // open razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: createData.amount,
        currency: createData.currency,
        name: "MarketMesh",
        description: "Order Payment",
        order_id: createData.id,
        prefill: { name: address.name || "", contact: address.phone || "" },
        handler: async function (response) {
          try {
            // verify on server
            const verifyRes = await fetch(
              `${API_BASE}/api/payments/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderPayload,
                  localOrderId,
                  userId: user?.id || user?._id || null,
                }),
              }
            );

            if (!verifyRes.ok) {
              const txt = await verifyRes.text().catch(() => "");
              throw new Error(
                `Payment verification failed: ${verifyRes.status} ${
                  txt || verifyRes.statusText
                }`
              );
            }

            const verifyData = await verifyRes.json();
            // verifyData should include { ok: true, paymentId, localOrderId }
            // Build local order to add to client state (use server returned localOrderId and payment id)
            const clientOrder = {
              id:
                verifyData.localOrderId ||
                localOrderId ||
                `local_${Date.now()}`,
              items: orderPayload.items,
              subtotal: orderPayload.subtotal,
              couponDiscount: orderPayload.couponDiscount,
              shipping: orderPayload.shipping,
              total: orderPayload.total,
              address: orderPayload.address,
              pincode: orderPayload.pincode,
              paid: true,
              payment: {
                method: paymentMethod,
                gateway: "razorpay",
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              },
              createdAt: Date.now(),
            };

            addOrder(clientOrder);
            toast.success("Payment successful — order placed!");
            onClose?.();
            navigate("/");
          } catch (err) {
            console.error("verify error:", err);
            toast.error(
              err?.message || "Payment verification failed. Contact support."
            );
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
          },
        },
        theme: { color: "#F37021" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("payment.failed", resp);
        toast.error("Payment failed. Try another method or contact support.");
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay flow error:", err);
      toast.error(err?.message || "Payment initialization failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label="Checkout modal"
    >
      <div className={styles.modalContent}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close checkout"
        >
          <X />
        </button>

        <header className={styles.modalHeader}>
          <div className={styles.modalTitle}>Checkout</div>
          <nav className={styles.steps} aria-hidden>
            <div
              className={`${styles.step} ${
                stage === 0 ? styles.stepActive : ""
              }`}
            >
              <span>1</span>
              <small>Address</small>
            </div>
            <div
              className={`${styles.step} ${
                stage === 1 ? styles.stepActive : ""
              }`}
            >
              <span>2</span>
              <small>Payment</small>
            </div>
            <div
              className={`${styles.step} ${
                stage === 2 ? styles.stepActive : ""
              }`}
            >
              <span>3</span>
              <small>Review</small>
            </div>
          </nav>
        </header>

        <div className={styles.modalBody}>
          {stage === 0 && (
            <>
              <h3 className={styles.sectionTitle}>Delivery Address</h3>
              <div className={styles.formGrid}>
                <input
                  className={styles.input}
                  placeholder="Full name"
                  value={address.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Phone (10 digits)"
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  inputMode="numeric"
                />
                <input
                  className={styles.inputFull}
                  placeholder="Address line (house, building, street)"
                  value={address.addressLine}
                  onChange={(e) => updateField("addressLine", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Pincode (6 digits)"
                  value={address.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className={styles.infoRow}>
                <div>
                  <strong>Deliver to:</strong>
                  <div className={styles.subtle}>
                    {address.name || "—"}{" "}
                    {address.pincode ? `• ${address.pincode}` : ""}
                  </div>
                </div>
                <div className={styles.addressActions}>
                  <button
                    className={styles.ghost}
                    onClick={() => {
                      setAddress({
                        name: "",
                        phone: "",
                        addressLine: "",
                        city: "",
                        state: "",
                        pincode: "",
                      });
                      toast.info("Address cleared");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}

          {stage === 1 && (
            <>
              <h3 className={styles.sectionTitle}>Payment Method</h3>
              <div className={styles.payMethods}>
                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />{" "}
                  <strong>UPI</strong>{" "}
                  <span className={styles.subtle}>(Fast, zero fees)</span>
                </label>
                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                  />{" "}
                  <strong>Card</strong>{" "}
                  <span className={styles.subtle}>(Visa / Mastercard)</span>
                </label>
                <label className={styles.payRow}>
                  <input
                    type="radio"
                    name="pay"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />{" "}
                  <strong>Cash on Delivery</strong>{" "}
                  <span className={styles.subtle}>(Pay on delivery)</span>
                </label>
              </div>
            </>
          )}

          {stage === 2 && (
            <>
              <h3 className={styles.sectionTitle}>Order Summary</h3>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Coupon</span>
                <span>-₹{couponDiscount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>

              <div className={styles.totalBox}>
                <div>
                  <div className={styles.subtle}>TOTAL</div>
                  <div style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                    ₹{total.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className={styles.miniNote}>Delivery in 3–5 days</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.modalActions}>
          <div className={styles.leftAction}>
            {stage > 0 && (
              <button className={styles.ghost} onClick={handleBack}>
                Back
              </button>
            )}
          </div>
          <div className={styles.rightAction}>
            {stage < 2 && (
              <button
                className={styles.primary}
                onClick={handleNext}
                disabled={processing}
              >
                {stage === 0 ? "Continue to payment" : "Review Order"}
              </button>
            )}
            {stage === 2 && (
              <button
                className={styles.primary}
                onClick={handlePlace}
                disabled={processing}
              >
                {processing
                  ? "Processing…"
                  : paymentMethod === "COD"
                  ? "Place Order (COD)"
                  : `Pay ₹${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModel;
