import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [todaysRevenue, setTodaysRevenue] = useState(0);

  useEffect(() => {
    axios.get("/api/reports").then((res) => {
      setLowStock(res.data.lowStock || []);
      setTopProducts(res.data.topProducts || []);
      setSalesByDay(res.data.salesByDay || []);
      setMonthlyRevenue(res.data.monthlyRevenue || 0);
      setTodaysRevenue(res.data.todaysRevenue || 0);
    });
  }, []);

  const exportCSV = () => {
    const data = {
      "Today's Revenue": todaysRevenue,
      "Monthly Revenue": monthlyRevenue,
      "Top Products": topProducts.map((p) => `${p.name} (${p.totalSold})`).join(", "),
      "Low Stock": lowStock.map((p) => `${p.name} (${p.quantity})`).join(", "),
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
        ["Today's Revenue", `Ksh ${todaysRevenue}`],
        ["Monthly Revenue", `Ksh ${monthlyRevenue}`],
        ["Top Products", topProducts.map((p) => `${p.name} (${p.totalSold})`).join(", ")],
        ["Low Stock", lowStock.map((p) => `${p.name} (${p.quantity})`).join(", ")],
      ],
    });
    doc.save("report.pdf");
  };

  return (
    <div className="page-root">
      <h2>Reports</h2>

      <div className="panel grid grid-cols-2 gap-4">
        <div className="report-card">
          <h3>Low Stock (below 5 units)</h3>
          <ul>
            {lowStock.map((p) => (
              <li key={p._id}>
                {p.name} - {p.quantity} units left
              </li>
            ))}
          </ul>
          <button onClick={exportCSV}>Export as Excel</button>
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
          <h3>Sales Totals</h3>
          <p>Today: Ksh {todaysRevenue}</p>
          <p>This Month: Ksh {monthlyRevenue}</p>
        </div>

        <div className="report-card">
          <h3>Sales by Day (last 30 days)</h3>
          <ul>
            {salesByDay.map((s) => (
              <li key={s._id}>
                {s._id}: Ksh {s.total}
              </li>
            ))}
          </ul>
        </div>

        <div className="report-card">
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
    </div>
  );
}
