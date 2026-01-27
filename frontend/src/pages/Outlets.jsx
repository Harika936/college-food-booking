import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Outlets.css";
const API_URL = import.meta.env.VITE_API_URL;


function Outlets() {
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);
  const [newOutlet, setNewOutlet] = useState({
    outlet_name: "",
    location: "",
    opening_time: "",
    closing_time: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchOutlets = async () => {
    try {
      const res = await axios.get(`${API_URL}/outlets`);

      setOutlets(res.data);
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setMessage("Failed to fetch outlets.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleChange = (e) => {
    setNewOutlet({ ...newOutlet, [e.target.name]: e.target.value });
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/outlets`, newOutlet);

      setMessage(res.data.message || "Outlet added successfully!");
      setMessageType("success");
      setNewOutlet({ outlet_name: "", location: "", opening_time: "", closing_time: "" });
      setShowForm(false);
      fetchOutlets();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding outlet:", err);
      setMessage(err?.response?.data?.error || "Failed to add outlet.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleManageMenu = (outletId) => {
    navigate(`/admin-menu/${outletId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="outlets-container">
      {/* Header */}
      <div className="outlets-header">
        <h1 className="outlets-title">🏢 Admin - Manage Outlets</h1>
        <button onClick={handleLogout} className="logout-button">
          🚪 Logout
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={messageType === "success" ? "success-message" : "error-message"}>
          {message}
        </div>
      )}

      {/* Add Outlet Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="add-outlet-button">
          ➕ Add New Outlet
        </button>
      )}

      {/* Add Outlet Form */}
      {showForm && (
        <div className="outlet-form-card">
          <h2 className="form-title">➕ Add New Outlet</h2>
          <form onSubmit={handleAddOutlet}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="outlet_name">Outlet Name</label>
                <input
                  id="outlet_name"
                  type="text"
                  name="outlet_name"
                  placeholder="e.g., Central Cafeteria"
                  value={newOutlet.outlet_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="e.g., Main Building, Ground Floor"
                  value={newOutlet.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="opening_time">Opening Time</label>
                <input
                  id="opening_time"
                  type="time"
                  name="opening_time"
                  value={newOutlet.opening_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="closing_time">Closing Time</label>
                <input
                  id="closing_time"
                  type="time"
                  name="closing_time"
                  value={newOutlet.closing_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? "Adding..." : "Add Outlet"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewOutlet({ outlet_name: "", location: "", opening_time: "", closing_time: "" });
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Outlets List */}
      <div className="outlets-section">
        <h2 className="section-title">📋 All Outlets ({outlets.length})</h2>

        {outlets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3 className="empty-state-title">No Outlets Yet</h3>
            <p className="empty-state-text">Start by adding your first outlet!</p>
          </div>
        ) : (
          <div className="outlets-grid">
            {outlets.map((outlet) => (
              <div key={outlet.outletId} className="outlet-card">
                <div className="outlet-card-header">
                  <h3 className="outlet-name">{outlet.name}</h3>
                  <span className="outlet-status">✓ Active</span>
                </div>

                <div className="outlet-details">
                  <p className="outlet-location">📍 {outlet.location}</p>
                  <p className="outlet-timing">
                    🕒 {outlet.opening_time} - {outlet.closing_time}
                  </p>
                </div>

                <button
                  onClick={() => handleManageMenu(outlet.outletId)}
                  className="manage-menu-button"
                >
                  🍽️ Manage Menu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Outlets;