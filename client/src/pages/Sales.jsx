import React, { useState } from "react";
import { PRODUCTS } from "../mockData";

export default function Sales() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  function add(product) {
    setItems((prev) => {
      const found = prev.find((p) => p.id === product.id);
      if (found) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p)));
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  return (
    <div className="page-root sales-root">
      <div className="left-col">
        <div className="search-row">
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or barcode..." />
        </div>

        <div className="product-grid">
          {PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)).map(p => (
            <div key={p.id} className="product-card" onClick={() => add(p)}>
              <div className="pname">{p.name}</div>
              <div className="pprice">${p.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="center-col">
        <h3>Scanned Products</h3>
        <table className="table">
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="empty">No items yet</td></tr>}
            {items.map(it => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>
                  <div className="qty-controls">
                    <button onClick={() => changeQty(it.id, -1)}>-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => changeQty(it.id, +1)}>+</button>
                  </div>
                </td>
                <td>${it.price.toFixed(2)}</td>
                <td>${(it.price * it.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="right-col">
        <div className="invoice">
          <h3>Invoice</h3>
          <div className="line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="line"><span>Tax (16%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="line total"><span>Total</span><span>${total.toFixed(2)}</span></div>

          <div className="action-row">
            <button className="green">Pay</button>
            <button className="red">Cancel</button>
            <button className="yellow">Add Discount</button>
          </div>
        </div>
      </div>
    </div>
  );
}
