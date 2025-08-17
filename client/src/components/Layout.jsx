import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import "./layout.css";

export default function Layout({ active, setActive, children }) {
  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <TopNav />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={active} setActive={setActive} />
        <main style={{ flex: 1, padding: "1rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
