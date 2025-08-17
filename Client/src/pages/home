import React from "react";

export default function Home({ setActive }) {
  return (
    <div className="page-root">
      <h2 className="page-title">Dashboard</h2>

      <div className="tiles">
        <div className="tile" onClick={() => setActive("sales")}>
          Sell Items
        </div>
        <div className="tile" onClick={() => setActive("products")}>
          Stock In
        </div>
        <div className="tile" onClick={() => setActive("inventory")}>
          Inventory List
        </div>
        <div className="tile" onClick={() => setActive("reports")}>
          Reports
        </div>
        <div className="tile" onClick={() => setActive("users")}>
          Users
        </div>
        <div className="tile" onClick={() => setActive("settings")}>
          Settings
        </div>
      </div>

      <div className="panel mt">
        <h3>Quick Actions & Activity (mock)</h3>
        <p>Recent sales and top products placeholders.</p>
      </div>
    </div>
  );
}
