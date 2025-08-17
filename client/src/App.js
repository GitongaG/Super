import React, { useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false); // set false to start on login page
  const [active, setActive] = useState("home");   // controls which page is shown

  // show login page if not logged in
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  // main layout with sidebar + top nav
  // main layout with sidebar + top nav
return (
  <Layout active={active} setActive={setActive}>
    {/* Pass setActive to the Home component */}
    {active === "home" && <Home setActive={setActive} />} 
    {active === "sales" && <Sales />}
    {active === "products" && <Products />}
    {active === "inventory" && <Inventory />}
    {active === "reports" && <Reports />}
    {active === "users" && <Users />}
    {active === "settings" && <Settings />}
  </Layout>
);
}
