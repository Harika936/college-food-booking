import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentMenu.css";

function StudentMenu() {
  const { outletId } = useParams();
  const navigate = useNavigate();

  const [outlet, setOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Beverages",
    "Desserts",
    "Bakery",
    "Juice Shop",
    "Cafeteria",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const outletRes = await axios.get(`http://localhost:5000/outlets/${outletId}`);
        setOutlet(Array.isArray(outletRes.data) ? outletRes.data[0] : outletRes.data);

        const menuRes = await axios.get(`http://localhost:5000/menu/${outletId}`);
        const availableItems = (menuRes.data || []).filter((item) => item.availability);
        setMenuItems(availableItems);
        setFilteredItems(availableItems);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu");
        setLoading(false);
      }
    };
    fetchData();
  }, [outletId]);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(
        menuItems.filter(
          (i) => i.category && i.category.toLowerCase() === category.toLowerCase()
        )
      );
    }
  };

  if (loading) return <div className="loading">Loading menu...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="student-menu-container">
      <button onClick={() => navigate("/student-outlets")}>← Back to Outlets</button>
      <h1>{outlet?.outlet_name || outlet?.name}</h1>
      <div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => filterByCategory(cat)}
            style={{ fontWeight: selectedCategory === cat ? "bold" : "normal" }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div>
        {filteredItems.length === 0 ? (
          <p>No items available in this category</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.item_id || item.id}>
              {item.name} - ₹{parseFloat(item.price).toFixed(2)} ({item.category})
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentMenu;
