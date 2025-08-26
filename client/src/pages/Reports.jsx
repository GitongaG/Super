import React, { useEffect, useState, useCallback } from "react";
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

  // ✅ Fix missing dependency warning by wrapping fetchReports in useCallback
  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get("/api/reports");
      setLowStock(res.data.lowStock || []);
      setTopProducts(res.data.topProducts || []);
      setSalesByDay(res.data.salesByDay || []);
      setMonthlyRevenue(res.data.monthlyRevenue || 0);
      setTodaysRevenue(res.data.todaysRevenue || 0);
    } catch (err) {
      console.error("Failed to fetch reports:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ✅ Export as Excel
  const exportCSV = () => {
    const data = [
      { Section: "Today's Revenue", Details: `Ksh ${todaysRevenue}` },
      { Section: "Monthly Revenue", Details: `Ksh ${monthlyRevenue}` },
      {
        Section: "Top Products",
        Details: topProducts.map((p) => `${p.name} (${p.totalSold})`).join(", "),
      },
      {
        Section: "Low Stock",
        Details: lowStock.map((p) => `${p.name} (${p.quantity})`).join(", "),
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  };

  // ✅ Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Supermarket Report", 14, 10);
    doc.autoTable({
      head: [["Section", "Details"]],
      body: [
        ["Today's Revenue", `Ksh ${todaysRevenue}`],
        ["Monthly Revenue", `Ksh ${monthlyRevenue}`],
        [
          "Top Products",
          topProducts.map((p) => `${p.name} (${p.totalSold})`).join(", "),
        ],
        [
          "Low Stock",
          lowStock.map((p) => `${p.name} (${p.quantity})`).join(", "),
        ],
      ],
    });
    doc.save("report.pdf");
  };

  return (
    <div className="page-root">
      <h2>Reports</h2>

      {/* ✅ 3 Columns Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Low Stock */}
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

        {/* Top Products */}
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

        {/* Sales Totals */}
        <div className="report-card">
          <h3>Sales Totals</h3>
          <p>Today: Ksh {todaysRevenue}</p>
          <p>This Month: Ksh {monthlyRevenue}</p>
        </div>
      </div>

      {/* Sales by Day */}
      <div className="report-card mt-6">
        <h3>Sales by Day (last 30 days)</h3>
        <ul>
          {salesByDay.map((s) => (
            <li key={s._id}>
              {s._id}: Ksh {s.total}
            </li>
          ))}
        </ul>
      </div>

      {/* Export Buttons */}
      <div className="report-card mt-6 flex gap-4">
        <button onClick={exportCSV}>Export Excel</button>
        <button onClick={exportPDF}>Export PDF</button>
      </div>
    </div>
  );
}
