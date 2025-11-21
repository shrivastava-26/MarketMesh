// src/pages/orders/Orders.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MeshContext } from "../../store/MeshContext";
import styles from "./orders.module.scss";

const Orders = () => {
  const { orders } = useContext(MeshContext);
  const navigate = useNavigate();

  if (!orders || orders.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <h2 className={styles.title}>Your Orders</h2>
        <p className={styles.emptyText}>No orders yet — place your first order!</p>
        <button className={styles.browseBtn} onClick={() => navigate("/")}>Browse products</button>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Orders</h2>
        <div className={styles.sub}>Recent purchases & invoices</div>
      </div>

      <div className={styles.list}>
        {orders.map((o) => (
          <article key={o.id} className={styles.card}>
            <div className={styles.cardLeft}>
              <div className={styles.orderId}>{o.id}</div>
              <div className={styles.orderMeta}>{new Date(o.createdAt).toLocaleString()}</div>
              <div className={styles.orderItems}>{o.items.length} item(s)</div>
            </div>

            <div className={styles.cardCenter}>
              <div className={styles.amountLabel}>Order Value</div>
              <div className={styles.amount}>₹{Number(o.total).toFixed(2)}</div>
            </div>

            <div className={styles.cardRight}>
              <div className={styles.status}>{o.status}</div>

              <div className={styles.actions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/orders/${o.id}`)}
                >
                  View
                </button>

                <button
                  className={styles.downloadBtn}
                  onClick={() => navigate(`/orders/${o.id}?download=1`)}
                >
                  Download
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Orders;
