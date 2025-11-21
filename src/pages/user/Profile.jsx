// src/pages/profile/Profile.jsx
import React, { useContext } from "react";
import { MeshContext } from "../../store/MeshContext";

const Profile = () => {
  const { user } = useContext(MeshContext);

  return (
    <div style={{ padding: 20, paddingTop: "calc(var(--topbar-height,80px) + 20px)" }}>
      <h2>Profile</h2>
      <div style={{ maxWidth: 720, marginTop: 12 }}>
        <p><strong>Name:</strong> {user?.name ?? "Not provided"}</p>
        <p><strong>Email:</strong> {user?.email ?? "Not provided"}</p>
        <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
      </div>
    </div>
  );
};

export default Profile;
