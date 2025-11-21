// src/pages/becomeSeller/BecomeSeller.jsx
import React from "react";

const BecomeSeller = () => {
  return (
    <div style={{ padding: 20, paddingTop: "calc(var(--topbar-height,80px) + 20px)", maxWidth: 800 }}>
      <h2>Become a seller</h2>
      <p>We’ll collect a few details and (in a real app) run KYC. For now add your store details and we’ll show a demo form.</p>

      <div style={{ marginTop: 12 }}>
        <label>Store name</label>
        <input style={{ width: "100%", padding: 8, marginTop: 6 }} placeholder="Your store name" />
        <label style={{ marginTop: 12 }}>GSTIN (optional)</label>
        <input style={{ width: "100%", padding: 8, marginTop: 6 }} placeholder="GSTIN" />
        <div style={{ marginTop: 12 }}>
          <button style={{ padding: "8px 12px", background: "#2874f0", color: "#fff", border: "none", borderRadius: 8 }}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
