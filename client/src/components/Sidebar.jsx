import React from "react";
import {
  FaHome,
  FaCashRegister,
  FaBox,
  FaWarehouse,
  FaChartBar,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import "./layout.css"; // lowercase to match actual file

const items = [
  { id: "home", icon: <FaHome />, label: "Home" },
  { id: "sales", icon: <FaCashRegister />, label: "Sales" },
  { id: "products", icon: <FaBox />, label: "Products" },
  { id: "inventory", icon: <FaWarehouse />, label: "Inventory" },
  { id: "reports", icon: <FaChartBar />, label: "Reports" },
  { id: "users", icon: <FaUsers />, label: "Users" },
  { id: "settings", icon: <FaCog />, label: "Settings" },
];

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      {items.map((it) => (
        <button
          key={it.id}
          className={`side-btn ${active === it.id ? "active" : ""}`}
          onClick={() => setActive(it.id)}
          title={it.label}
        >
          <div className="icon">{it.icon}</div>
        </button>
      ))}
    </aside>
  );
}
