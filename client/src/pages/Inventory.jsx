import React from "react";

export default function Inventory() {
  const inventory = [
    { id: 1, name: "Apple", location: "Shelf A1", qty: 10, restock: "7 days" },
    { id: 2, name: "Milk", location: "Fridge 1", qty: 5, restock: "3 days" },
  ];

  return (
    <div className="page-root">
      <h2>Inventory</h2>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Product</th><th>Location</th><th>Qty</th><th>Restock ETA</th></tr></thead>
          <tbody>
            {inventory.map(it => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.location}</td>
                <td className={it.qty < 6 ? "low" : ""}>{it.qty}</td>
                <td>{it.restock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
