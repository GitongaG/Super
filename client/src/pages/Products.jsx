import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

// Backend API base URL (local vs deployed)
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://super-backend-xxxx.onrender.com"); // 🔴 Replace xxxx with your backend Render name

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    quantity: "",
    price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get token from localStorage (saved during login)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load products. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input for new product
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.barcode || !newProduct.quantity || !newProduct.price) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newProduct,
          quantity: parseInt(newProduct.quantity, 10),
          price: parseFloat(newProduct.price),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add product: ${response.status} - ${errorText}`);
      }

      await response.json();
      setNewProduct({ name: "", barcode: "", quantity: "", price: "" });
      await fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setError(`Error adding product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit product
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditedData({
      name: product.name,
      barcode: product.barcode,
      quantity: product.quantity,
      price: product.price,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const handleSaveClick = async (id) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...editedData,
          quantity: parseInt(editedData.quantity, 10),
          price: parseFloat(editedData.price),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update product: ${response.status} - ${errorText}`);
      }

      setEditingId(null);
      setEditedData({});
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      setError(`Error updating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const handleCancelClick = () => {
    setEditingId(null);
    setEditedData({});
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete product: ${response.status} - ${errorText}`);
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(`Error deleting product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <h2>Product Management</h2>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            margin: "10px 0",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div className="panel mt">
        <h3>Add New Product</h3>
        <form onSubmit={handleAddProduct}>
          <div>
            <label>Name*</label>
            <input
              className="input"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label>Barcode*</label>
            <input
              className="input"
              name="barcode"
              value={newProduct.barcode}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label>Quantity*</label>
            <input
              className="input"
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              disabled={loading}
              min="0"
              required
            />
          </div>
          <div>
            <label>Price (Ksh)*</label>
            <input
              className="input"
              type="number"
              step="0.01"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              disabled={loading}
              min="0"
              required
            />
          </div>
          <button type="submit" className="primary-btn mt" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>

      <div className="panel mt">
        <h3>Products List</h3>
        {loading && <p>Loading...</p>}

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>
                  No products found. Add some products to get started.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  {editingId === p._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editedData.name}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="barcode"
                          value={editedData.barcode}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="quantity"
                          value={editedData.quantity}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          value={editedData.price}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </td>
                      <td className="actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleSaveClick(p._id)}
                          disabled={loading}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="icon-btn red"
                          onClick={handleCancelClick}
                          disabled={loading}
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{p.name}</td>
                      <td>{p.barcode}</td>
                      <td>{p.quantity}</td>
                      <td>Ksh {p.price ? p.price.toFixed(2) : "0.00"}</td>
                      <td className="actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleEditClick(p)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="icon-btn red"
                          onClick={() => handleDeleteProduct(p._id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
