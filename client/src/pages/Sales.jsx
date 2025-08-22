import React, { useState, useEffect } from "react";

// Backend API base URL (same logic as Products.jsx)
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://super-backend-xxxx.onrender.com"); // 🔴 replace xxxx with your backend Render name

export default function Sales() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]); // cart
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check backend.");
    }
  }

  function add(product) {
    setItems((prev) => {
      const found = prev.find((p) => p._id === product._id);
      if (found)
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p
        );
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setItems((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p
      )
    );
  }

  async function handlePay() {
    if (items.length === 0) return alert("Cart is empty!");

    try {
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const discountedSubtotal = subtotal * (1 - discount / 100);
      const tax = discountedSubtotal * 0.16;
      const total = discountedSubtotal + tax;

      const payload = {
        items: items.map((it) => ({
          productId: it._id,
          name: it.name,
          price: it.price,
          qty: it.qty,
        })),
        subtotal,
        tax,
        total,
        paymentMethod: "cash", // hardcoded for now
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to complete sale");
      }

      const result = await response.json();
      alert("Sale completed successfully ✅");

      // refresh stock
      fetchProducts();
      // clear cart
      setItems([]);
      setDiscount(0);
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Payment failed. Please try again.");
    }
  }

  function handleCancel() {
    if (window.confirm("Cancel this transaction?")) {
      setItems([]);
      setDiscount(0);
    }
  }

  function handleDiscount() {
    const val = prompt("Enter discount percentage (e.g., 10 for 10%)", discount);
    if (val !== null && !isNaN(val)) {
      setDiscount(Math.min(Math.max(Number(val), 0), 100));
    }
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discountedSubtotal = subtotal * (1 - discount / 100);
  const tax = discountedSubtotal * 0.16;
  const total = discountedSubtotal + tax;

  return (
    <div className="page-root sales-root">
      <div className="left-col">
        <div className="search-row">
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or barcode..."
          />
        </div>

        {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}

        <div className="product-grid">
          {products
            .filter(
              (p) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.barcode.includes(search)
            )
            .map((p) => (
              <div key={p._id} className="product-card" onClick={() => add(p)}>
                <div className="pname">{p.name}</div>
                <div className="pprice">Ksh {p.price.toFixed(2)}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="center-col">
        <h3>Scanned Products</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  No items yet
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it._id}>
                <td>{it.name}</td>
                <td>
                  <div className="qty-controls">
                    <button onClick={() => changeQty(it._id, -1)}>-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => changeQty(it._id, +1)}>+</button>
                  </div>
                </td>
                <td>Ksh {it.price.toFixed(2)}</td>
                <td>Ksh {(it.price * it.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="right-col">
        <div className="invoice">
          <h3>Invoice</h3>
          <div className="line">
            <span>Subtotal</span>
            <span>Ksh {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="line">
              <span>Discount ({discount}%)</span>
              <span>- Ksh {(subtotal - discountedSubtotal).toFixed(2)}</span>
            </div>
          )}
          <div className="line">
            <span>Tax (16%)</span>
            <span>Ksh {tax.toFixed(2)}</span>
          </div>
          <div className="line total">
            <span>Total</span>
            <span>Ksh {total.toFixed(2)}</span>
          </div>

          <div className="action-row">
            <button className="green" onClick={handlePay}>
              Pay
            </button>
            <button className="red" onClick={handleCancel}>
              Cancel
            </button>
            <button className="yellow" onClick={handleDiscount}>
              Add Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
