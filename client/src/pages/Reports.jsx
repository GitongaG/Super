import React from "react";

export default function Reports() {
  return (
    <div className="page-root">
      <h2>Reports</h2>

      <div className="panel">
        <div className="report-row">
          <div className="report-card">Sales by Day (mock chart)</div>
          <div className="report-card">Top Products (mock)</div>
        </div>

        <div className="mt">
          <p>Filters and export (CSV / PDF) placeholders.</p>
        </div>
      </div>
    </div>
  );
}
