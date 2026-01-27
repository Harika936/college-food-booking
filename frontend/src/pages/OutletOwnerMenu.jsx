import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./OutletOwnerMenu.css";
const API_URL = import.meta.env.VITE_API_URL;


function OutletOwnerMenu() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Menu items state
  const [menuItems, setMenuItems] = useState([]);

  // Form for menu item
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    availability: true,
  });

  const [editingItemId, setEditingItemId] = useState(null);

  const handleMenuChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuForm({
      ...menuForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Add or Update Menu Item
  const handleAddOrUpdateMenuItem = async (e) => {
    e.preventDefault();
    if (!outlet) return;

    try {
      if (editingItemId) {
        // Update menu item
        await axios.put(`${API_URL}/menu/${editingItemId}` ,{
          name: menuForm.name,
          price: parseFloat(menuForm.price),
          availability: menuForm.availability ? 1 : 0,
        });

        setMenuItems(menuItems.map(item => item.item_id === editingItemId
          ? { ...item, ...menuForm }
          : item
        ));
        setEditingItemId(null);
        alert("Menu item updated successfully!");
      } else {
        // Add new menu item
        const res =await axios.post(`${API_URL}/menu`, {
          outlet_id: outlet.outlet_id,
          name: menuForm.name,    // match backend
          price: parseFloat(menuForm.price),
          availability: menuForm.availability ? 1 : 0,
        });

        setMenuItems([...menuItems, {
          item_id: res.data.item_id,
          name: menuForm.name,
          price: menuForm.price,
          availability: menuForm.availability
        }]);
        alert("Menu item added successfully!");
      }

      setMenuForm({ name: "", price: "", availability: true });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleEditMenuItem = (item) => {
    setMenuForm({ name: item.name, price: item.price, availability: item.availability });
    setEditingItemId(item.item_id);
  };

  const handleDeleteMenuItem = async (item_id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await axios.delete(`${API_URL}/menu/${item_id}`);
      setMenuItems(menuItems.filter(item => item.item_id !== item_id));
      alert("Menu item deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Delete failed");
    }
  };

  // Outlet form
  const [outletForm, setOutletForm] = useState({
    outlet_name: "",
    location: "",
    opening_time: "",
    closing_time: "",
  });

  const handleOutletChange = (e) => {
    const { name, value } = e.target;
    setOutletForm({ ...outletForm, [name]: value });
  };

  const handleCreateOutlet = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/outlets`, {
        ...outletForm,
        admin_id: user.user_id,
      });

      setOutlet(res.data);
      const updatedUser = { ...user, outlet_id: res.data.outlet_id };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Outlet created successfully!");
    } catch (err) {
      console.error("Failed to create outlet:", err.response?.data || err.message);
      alert(err?.response?.data?.error || "Failed to create outlet");
    }
  };

  // Fetch existing outlet and menu items
  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "outlet_owner") return navigate("/login");

    const fetchOutletAndMenu = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/outlets/owner/${user.user_id}`
        );
        if (res.data) {
          setOutlet(res.data);
          const updatedUser = { ...user, outlet_id: res.data.outlet_id };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          // Fetch menu items
          const menuRes = await axios.get(
            `${API_URL}/menu/${res.data.outlet_id}`
          );
          setMenuItems(menuRes.data.map(item => ({
            item_id: item.item_id,
            name: item.name || item.item_name,
            price: item.price,
            availability: item.availability === 1 || item.availability === true
          })));
        }
      } catch (err) {
        console.error("Error fetching outlet or menu:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOutletAndMenu();
  }, [user, navigate]);

  if (loading) return <h2>Loading...</h2>;

  if (!outlet) {
    return (
      <div className="create-outlet-container">
        <h2>🎉 Welcome {user.name}!</h2>
        <h3>Create your Outlet</h3>
        <form onSubmit={handleCreateOutlet}>
          <input
            name="outlet_name"
            placeholder="Outlet Name"
            value={outletForm.outlet_name}
            onChange={handleOutletChange}
            required
          />
          <input
            name="location"
            placeholder="Location"
            value={outletForm.location}
            onChange={handleOutletChange}
            required
          />
          <input
            name="opening_time"
            type="time"
            value={outletForm.opening_time}
            onChange={handleOutletChange}
            required
          />
          <input
            name="closing_time"
            type="time"
            value={outletForm.closing_time}
            onChange={handleOutletChange}
            required
          />
          <button type="submit">Create Outlet</button>
        </form>
      </div>
    );
  }

  return (
    <div className="outlet-owner-container">
      <h2>🍽️ {outlet.outlet_name} Menu Management</h2>
      <p>Welcome, {user.name}!</p>

      <h3>{editingItemId ? "Edit Menu Item" : "Add New Menu Item"}</h3>
      <form onSubmit={handleAddOrUpdateMenuItem}>
        <input
          name="name"
          placeholder="Item Name"
          value={menuForm.name}
          onChange={handleMenuChange}
          required
        />
        <input
          name="price"
          placeholder="Price"
          type="number"
          value={menuForm.price}
          onChange={handleMenuChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="availability"
            checked={menuForm.availability}
            onChange={handleMenuChange}
          />
          Available
        </label>
        <button type="submit">{editingItemId ? "Update Menu Item" : "Add Menu Item"}</button>
      </form>

      <h3>Current Menu Items</h3>
      {menuItems.length === 0 ? (
        <p>No menu items yet. Start adding!</p>
      ) : (
        <ul>
          {menuItems.map((item) => (
            <li key={item.item_id}>
              {item.name} - ₹{item.price} {item.availability ? "✓" : "✗"}{" "}
              <button onClick={() => handleEditMenuItem(item)}>Edit</button>{" "}
              <button onClick={() => handleDeleteMenuItem(item.item_id)}>Delete</button>
            </li>
          ))}
        </ul>
        
      )}
      {/* <button
  onClick={() => navigate("/owner/orders")}
  style={{
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "15px"
  }}
>
  📦 Show Orders
</button> */}

    </div>
  );
  
}


export default OutletOwnerMenu;

