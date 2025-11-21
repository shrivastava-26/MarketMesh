// src/pages/orders/OrderDetail.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MeshContext } from "../../store/MeshContext";
import { toast } from "react-toastify";
import QRCodeLib from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./orderDetail.module.scss";

const fmt = (n) => "₹" + (Number(n) || 0).toFixed(2);

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const downloadMode = searchParams.get("download") === "1";

  const { orders, user } = useContext(MeshContext);
  const order = useMemo(() => orders?.find((o) => o.id === id), [orders, id]);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const invoiceRef = useRef(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!order) {
      toast.error("Order not found");
      navigate("/orders");
      return;
    }

    const payload = JSON.stringify({
      orderId: order.id,
      total: order.total,
      createdAt: order.createdAt,
      ref: `${window.location.origin}/orders/${order.id}`,
    });

    QRCodeLib.toDataURL(payload, { margin: 1, scale: 8 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error("QR generation failed", err);
        setQrDataUrl(null);
      });
  }, [order, navigate]);

  // helper to generate PDF from invoiceRef
  const generatePdf = async () => {
    if (!invoiceRef.current || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      toast.info("Preparing PDF...");
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 20;
      const imgWidth = pageWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = margin;
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      let heightLeft = imgHeight - (pageHeight - margin * 2);

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, - (imgHeight - heightLeft) + margin, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      const filename = `${order.id}_invoice.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };

  // auto-download when ?download=1
  useEffect(() => {
    if (!downloadMode) return;
    const timer = setTimeout(() => {
      if (qrDataUrl && invoiceRef.current) {
        generatePdf();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [downloadMode, qrDataUrl, invoiceRef.current]);

  if (!order) return null;

  const marketMeshAddress = [
    "MarketMesh Pvt. Ltd.",
    "No. 12, Commerce Street",
    "Bengaluru — 560001",
    "support@marketmesh.example",
    "+91 9576454311",
  ];

  const invoiceDate = new Date().toLocaleString();
  const orderDate = new Date(order.createdAt).toLocaleString();
  const totalItemCost = order.items.reduce((s, it) => s + (it.product.price || 0) * it.qty, 0);

  // Payment data convenience
  const paid = !!order.paid;
  const payment = order.payment || null;
  const paymentMethod = payment?.method || (paid ? "Online" : "COD");
  const paymentGateway = payment?.gateway || (paid ? "razorpay" : null);
  const paidAt = payment?.paidAt ? new Date(payment.paidAt).toLocaleString() : (paid ? orderDate : null);

  // small util to copy text
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  return (
    <div className={styles.page}>
      <article className={styles.card} ref={invoiceRef} id="invoice-root">
        {/* HEADER: address left, qr right */}
        <header className={styles.header}>
          <div>
            <div className={styles.brandName}>MarketMesh</div>
            <div className={styles.brandSub}>{marketMeshAddress.slice(0, 3).join(" • ")}</div>

            <div style={{ marginTop: 8 }}>
              {/* Paid badge */}
              {paid ? (
                <span className={`${styles.badge} ${styles.badgePaid}`}>Paid</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgePending}`}>{paymentMethod === "COD" ? "Cash on Delivery" : "Pending"}</span>
              )}
            </div>

            <div className={styles.muted} style={{ marginTop: 8 }}>
              {marketMeshAddress.join(", ")}
            </div>
          </div>

          <div className={styles.qrWrap}>
            {qrDataUrl ? <img src={qrDataUrl} alt="QR" className={styles.qr} /> : <div className={styles.qrPlaceholder} />}
          </div>
        </header>

        <hr className={styles.hr} />

        {/* Seller (MarketMesh) left + Ship To right */}
        <div className={styles.soldBillRow}>
          <div className={styles.soldBox}>
            <div className={styles.sectionTitle}>Seller</div>
            <div className={styles.soldText}>
              {marketMeshAddress.map((ln, i) => <div key={i}>{ln}</div>)}
            </div>
          </div>

          <div className={styles.billBox}>
            <div className={styles.sectionTitle}>Ship To</div>
            <div className={styles.billText}>
              <div className={styles.billName}>{order.address?.name || user?.name || "Recipient"}</div>
              <div className={styles.muted}>{order.address?.addressLine}</div>
              <div className={styles.muted}>{order.address?.city}, {order.address?.state} — {order.address?.pincode}</div>
              <div className={styles.muted}>Phone: {order.address?.phone || "—"}</div>
            </div>
          </div>
        </div>

        {/* Order meta row */}
        <div className={styles.metaRow} style={{ marginTop: 12 }}>
          <div>
            <div className={styles.metaLabel}>Order time</div>
            <div className={styles.metaValue}>{orderDate}</div>
          </div>
          <div>
            <div className={styles.metaLabel}>Invoice date</div>
            <div className={styles.metaValue}>{invoiceDate}</div>
          </div>
          <div>
            <div className={styles.metaLabel}>Total price</div>
            <div className={styles.metaValue}>{fmt(order.total)}</div>
          </div>
        </div>

        {/* NEW: Payment details block */}
        <div className={styles.paymentBlock} style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className={styles.sectionTitle}>Payment Details</div>
              <div className={styles.muted} style={{ marginTop: 6 }}>
                {paid ? "Transaction completed" : (paymentMethod === "COD" ? "Cash on Delivery" : "Awaiting payment")}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{paid ? fmt(order.total) : fmt(order.total)}</div>
              <div className={styles.subtle}>{paymentGateway ? paymentGateway.toUpperCase() : (paymentMethod === "COD" ? "COD" : "—")}</div>
            </div>
          </div>

          {payment && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#222" }}><strong>Method:</strong> {payment.method}</div>
                <div style={{ fontSize: 13, color: "#222", marginTop: 6 }}><strong>Payment ID:</strong> {payment.paymentId || "—"}</div>
                <div style={{ fontSize: 13, color: "#222", marginTop: 6 }}><strong>Order ID:</strong> {payment.orderId || "—"}</div>
                {paidAt && <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}><strong>Paid at:</strong> {paidAt}</div>}
                {payment.status && <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}><strong>Status:</strong> {payment.status}</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {payment.paymentId && (
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(payment.paymentId)}>Copy payment ID</button>
                )}
                {payment.orderId && (
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(payment.orderId)}>Copy order ID</button>
                )}
              </div>
            </div>
          )}
        </div>

        <h3 className={styles.detailsTitle} style={{ marginTop: 20 }}>Order Details</h3>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Item</th>
                <th className={`${styles.th} ${styles.center}`}>Qty</th>
                <th className={`${styles.th} ${styles.right}`}>Price</th>
                <th className={`${styles.th} ${styles.right}`}>Line Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td className={styles.td}>
                    <div className={styles.itemTitle}>{it.product.title}</div>
                    <div className={styles.itemMeta}>{it.product.brand} · {it.product.category}</div>
                  </td>
                  <td className={`${styles.td} ${styles.center}`}>{it.qty}</td>
                  <td className={`${styles.td} ${styles.right}`}>{fmt(it.product.price || 0)}</td>
                  <td className={`${styles.td} ${styles.right}`}>{fmt((it.product.price || 0) * it.qty)}</td>
                </tr>
              ))}

              <tr><td colSpan={4} className={styles.spacer} /></tr>

              <tr>
                <td colSpan={2} />
                <td className={`${styles.td} ${styles.right} ${styles.bold}`}>Total item cost</td>
                <td className={`${styles.td} ${styles.right} ${styles.bold}`}>{fmt(totalItemCost)}</td>
              </tr>

              <tr>
                <td colSpan={2} />
                <td className={`${styles.td} ${styles.right}`}>Coupon discount</td>
                <td className={`${styles.td} ${styles.right} ${order.couponDiscount ? styles.red : ""}`}>
                  {order.couponDiscount ? `- ${fmt(order.couponDiscount)}` : "—"}
                </td>
              </tr>

              <tr>
                <td colSpan={2} />
                <td className={`${styles.td} ${styles.right}`}>Shipping</td>
                <td className={`${styles.td} ${styles.right}`}>{fmt(order.shipping || 0)}</td>
              </tr>

              <tr>
                <td colSpan={2} />
                <td className={`${styles.td} ${styles.right} ${styles.grandLabel}`}>Grand Total</td>
                <td className={`${styles.td} ${styles.right} ${styles.grandValue}`}>{fmt(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer className={styles.footer}>
          <div className={styles.signature}>
            <div className={styles.forText}>For MarketMesh</div>
            <div className={styles.signName}>Authorized Signatory</div>
            <div className={styles.signNote}>Signature</div>
          </div>

          <div className={styles.thank}>
            <div className={styles.logoSmall}>M</div>
            <div className={styles.thankText}>Thank you for your purchase!</div>
            <div className={styles.muted}>support@marketmesh.example</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
