import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    axios.get("/api/reports").then((res) => {
      setLowStock(res.data.lowStock || []);
      setSalesByDay(res.data.salesByDay || []);
      setTopProducts(res.data.topProducts || []);
      setMonthlyRevenue(res.data.monthlyRevenue || 0);
    });
  }, []);

  const exportCSV = () => {
    const data = {
      MonthlyRevenue: monthlyRevenue,
      SalesByDay: salesByDay,
      TopProducts: topProducts,
      LowStock: lowStock,
    };
    const ws = XLSX.utils.json_to_sheet([data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Supermarket Report", 14, 10);
    doc.autoTable({
      head: [["Section", "Details"]],
      body: [
        ["Monthly Revenue", `$${monthlyRevenue}`],
        ["Low Stock", lowStock.map(p => `${p.name} (${p.quantity})`).join(", ")],
        ["Sales By Day", salesByDay.map(s => `${s._id}: ${s.total}`).join(", ")],
        ["Top Products", topProducts.map(p => `${p.name} (${p.totalSold})`).join(", ")]
      ],
    });
    doc.save("report.pdf");
  };

  return (
    <div className="page-root">
      <h2>Reports</h2>

      <div className="panel">
        <div className="report-card">
          <h3>Low Stock (below 5 units)</h3>
          <ul>
            {lowStock.map((p) => (
              <li key={p._id}>
                {p.name} - {p.quantity} units left
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card">
          <h3>Sales by Day</h3>
          <ul>
            {salesByDay.map((s) => (
              <li key={s._id}>
                {s._id}: {s.total}
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card">
          <h3>Top 3 Products</h3>
          <ul>
            {topProducts.map((p) => (
              <li key={p._id}>
                {p.name} - {p.totalSold} sold
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card">
          <h3>Total Monthly Revenue</h3>
          <p>${monthlyRevenue}</p>
        </div>

        <div className="report-card">
          <button onClick={exportCSV}>Export CSV/Excel</button>
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}
