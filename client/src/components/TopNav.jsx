import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function TopNav({ storeName, user, onLogout }) {
  return (
    <header className="topnav">
      <div className="left">
        <div className="brand">{storeName}</div>
        <div className="subtitle">Desktop POS • 1280×800</div>
      </div>

      <div className="right">
        <div className="profile">
          <img src="https://via.placeholder.com/36" alt="profile" className="avatar" />
          <div className="meta">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
        <button className="logout" onClick={onLogout} title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
