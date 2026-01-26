
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminMenu.css";

function AdminMenu() {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item_name: "",
    price: "",
    category: "",
    availability: true,
  });

  // Check authentication and fetch outlets - FIXED
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    // Fetch outlets
    const fetchOutlets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/outlets");
        setOutlets(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching outlets:", err);
        setError("Failed to load outlets");
        setLoading(false);
      }
    };

    fetchOutlets();
  }, [navigate]);

  // Fetch menu items for selected outlet
  const fetchMenuItems = async (outletId) => {
    try {
      const response = await axios.get(`http://localhost:5000/menu/${outletId}`);
      setMenuItems(response.data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setMenuItems([]);
    }
  };

  const handleOutletSelect = (outlet) => {
    setSelectedOutlet(outlet);
    setShowAddForm(false);
    setEditingItem(null);
    fetchMenuItems(outlet.outlet_id);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedOutlet) {
      setMessage("Please select an outlet first");
      setMessageType("error");
      return;
    }

    try {
      console.log("Adding menu item:", formData);

      const response = await axios.post(
        `http://localhost:5000/menu/${selectedOutlet.outlet_id}`,
        {
          item_name: formData.item_name,
          price: parseFloat(formData.price),
          category: formData.category,
          availability: formData.availability,
        }
      );

      console.log("Item added:", response.data);

      // Add to menu items list
      const newItem = {
        item_id: response.data.itemId,
        name: formData.item_name,
        price: parseFloat(formData.price),
        category: formData.category,
        availability: formData.availability,
        outlet_id: selectedOutlet.outlet_id,
      };

      setMenuItems([newItem, ...menuItems]);
      setMessage("Menu item added successfully!");
      setMessageType("success");
      setShowAddForm(false);
      setFormData({ item_name: "", price: "", category: "", availability: true });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Add error:", err);
      setMessage(err?.response?.data?.error || "Failed to add menu item");
      setMessageType("error");
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedOutlet || !editingItem) return;

    try {
      await axios.put(
        `http://localhost:5000/menu/${selectedOutlet.outlet_id}/${editingItem.item_id}`,
        {
          item_name: formData.item_name,
          price: parseFloat(formData.price),
          category: formData.category,
          availability: formData.availability,
        }
      );

      // Update menu items list
      setMenuItems(
        menuItems.map((item) =>
          item.item_id === editingItem.item_id
            ? {
                ...item,
                name: formData.item_name,
                price: parseFloat(formData.price),
                category: formData.category,
                availability: formData.availability,
              }
            : item
        )
      );

      setMessage("Menu item updated successfully!");
      setMessageType("success");
      setEditingItem(null);
      setFormData({ item_name: "", price: "", category: "", availability: true });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setMessage(err?.response?.data?.error || "Failed to update menu item");
      setMessageType("error");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    if (!selectedOutlet) return;

    try {
      await axios.delete(
        `http://localhost:5000/menu/${selectedOutlet.outlet_id}/${itemId}`
      );

      setMenuItems(menuItems.filter((item) => item.item_id !== itemId));
      setMessage("Menu item deleted successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setMessage(err?.response?.data?.error || "Failed to delete menu item");
      setMessageType("error");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.name,
      price: item.price,
      category: item.category || "",
      availability: item.availability,
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setFormData({ item_name: "", price: "", category: "", availability: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get user from localStorage for display
  const user = JSON.parse(localStorage.getItem("user"));

  if (loading) {
    return (
      <div className="admin-menu-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading outlets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-menu-container">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={handleLogout} className="logout-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-menu-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="page-title">🍽️ Admin - Menu Management</h1>
          <p className="welcome-text">Welcome, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={messageType === "success" ? "success-message" : "error-message"}>
          {message}
        </div>
      )}

      {/* Outlets Selection */}
      <div className="outlets-section">
        <h2 className="section-title">🏪 Select Outlet</h2>
        <div className="outlets-grid">
          {outlets.map((outlet) => (
            <div
              key={outlet.outlet_id}
              className={`outlet-card ${
                selectedOutlet?.outlet_id === outlet.outlet_id ? "selected" : ""
              }`}
              onClick={() => handleOutletSelect(outlet)}
            >
              <h3>{outlet.outlet_name}</h3>
              <p>📍 {outlet.location}</p>
              <p>
                🕒 {outlet.opening_time} - {outlet.closing_time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Management Section */}
      {selectedOutlet && (
        <>
          {/* Add Item Button */}
          {!showAddForm && !editingItem && (
            <div className="admin-actions">
              <button onClick={() => setShowAddForm(true)} className="add-item-button">
                ➕ Add Menu Item to {selectedOutlet.outlet_name}
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingItem) && (
            <div className="menu-form-container">
              <h3>
                {editingItem
                  ? `✏️ Edit Menu Item - ${selectedOutlet.outlet_name}`
                  : `➕ Add Menu Item - ${selectedOutlet.outlet_name}`}
              </h3>
              <form
                onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                className="menu-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="item_name">Item Name</label>
                    <input
                      id="item_name"
                      type="text"
                      name="item_name"
                      placeholder="e.g., Chicken Burger"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Bakery">Bakery</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price (₹)</label>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label htmlFor="availability">
                      <input
                        id="availability"
                        type="checkbox"
                        name="availability"
                        checked={formData.availability}
                        onChange={handleChange}
                      />
                      <span>Available</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      cancelEdit();
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu Items */}
          <div className="menu-items-section">
            <h2 className="section-title">
              📋 Menu Items for {selectedOutlet.outlet_name} ({menuItems.length})
            </h2>

            {menuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No Menu Items Yet</h3>
                <p>Start adding items to this outlet's menu!</p>
              </div>
            ) : (
              <div className="menu-grid">
                {menuItems.map((item) => (
                  <div key={item.item_id} className="menu-item-card">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <span
                        className={`availability-badge ${
                          item.availability ? "available" : "unavailable"
                        }`}
                      >
                        {item.availability ? "✓ Available" : "✗ Unavailable"}
                      </span>
                    </div>

                    {item.category && (
                      <p className="item-category">🏷️ {item.category}</p>
                    )}
                    <p className="item-price">₹{parseFloat(item.price).toFixed(2)}</p>

                    <div className="item-actions">
                      <button onClick={() => startEdit(item)} className="edit-button">
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.item_id)}
                        className="delete-button"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminMenu;