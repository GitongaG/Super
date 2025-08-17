import React, { useState } from "react";

export default function Settings() {
  // 1. Create state variables to hold the input values
  const [storeName, setStoreName] = useState("Supermarket POS");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("16");

  return (
    <div className="page-root">
      <h2>Settings</h2>

      <div className="panel">
        <div className="settings-grid">
          <div>
            <label>Store name</label>
            {/* 2. Bind the input value to the state variable */}
            <input
              className="input"
              value={storeName}
              // 3. Update the state whenever the input changes
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div>
            <label>Currency</label>
            <input
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          <div>
            <label>Tax rate (%)</label>
            <input
              className="input"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt">
          <p>More system configuration placeholders (receipt template, integrations).</p>
        </div>
      </div>
    </div>
  );
}