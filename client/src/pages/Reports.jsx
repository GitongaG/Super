// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  // Fetch report data from backend
  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setLowStock(data.lowStock);
        setDailySales(data.dailySales);
        setTopProducts(data.topProducts);
        setMonthlyRevenue(data.monthlyRevenue);
      })
      .catch((err) => console.error("Error loading reports:", err));
  }, []);

  // Export as CSV
  const exportCSV = () => {
    const csv = Papa.unparse({
      fields: ["Date", "Sales"],
      data: dailySales.map((d) => [d.date, d.total]),
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "daily_sales.csv");
  };

  // Export as Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dailySales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DailySales");
    XLSX.writeFile(wb, "daily_sales.xlsx");
  };

  // Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Daily Sales Report", 14, 10);
    doc.autoTable({
      head: [["Date", "Sales"]],
      body: dailySales.map((d) => [d.date, d.total]),
    });
    doc.save("daily_sales.pdf");
  };

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      {/* Monthly Revenue */}
      <Card className="bg-green-100">
        <CardHeader>
          <CardTitle>Total Revenue (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">KES {monthlyRevenue.toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {topProducts.map((p, idx) => (
              <li key={idx} className="flex justify-between border-b py-1">
                <span>{p.name}</span>
                <span>{p.quantity} sold</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Running Out (≤ 5 units)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {lowStock.length === 0 ? (
              <p>✅ All good! No low stock.</p>
            ) : (
              lowStock.map((p, idx) => (
                <li key={idx} className="flex justify-between border-b py-1">
                  <span>{p.name}</span>
                  <span>{p.stock} left</span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Daily Sales */}
      <Card className="col-span-2">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Daily Sales</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportCSV}>CSV</Button>
            <Button onClick={exportExcel}>Excel</Button>
            <Button onClick={exportPDF}>PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Sales</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map((d, idx) => (
                <tr key={idx} className="text-center">
                  <td className="p-2 border">{d.date}</td>
                  <td className="p-2 border">KES {d.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
