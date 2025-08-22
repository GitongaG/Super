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
    axios.get("/api/reports/low-stock").then((res) => setLowStock(res.data));
    axios.get("/api/reports/sales-by-day").then((res) => setSalesByDay(res.data));
    axios.get("/api/reports/top-products").then((res) => setTopProducts(res.data));
    axios.get("/api/reports/monthly-revenue").then((res) =>
      setMonthlyRevenue(res.data.totalRevenue || 0)
    );
  }, []);

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet([
      { MonthlyRevenue: monthlyRevenue },
      ...salesByDay,
      ...topProducts,
      ...lowStock
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Supermarket Report", 14, 10);
    doc.autoTable({
      head: [["Type", "Details"]],
      body: [
        ["Monthly Revenue", monthlyRevenue],
        ["Low Stock", JSON.stringify(lowStock)],
        ["Sales By Day", JSON.stringify(salesByDay)],
        ["Top Products", JSON.stringify(topProducts)]
      ]
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
                {s._id}: {s.totalSales}
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card">
          <h3>Top 3 Products</h3>
          <ul>
            {topProducts.map((p) => (
              <li key={p._id}>
                {p.name} - {p.totalQty} sold
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
