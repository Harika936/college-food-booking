import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentOutlets.css";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

function StudentOutlets() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [outletId, setOutletId] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // ✅ Use useMemo for stable user object to fix ESLint warning
  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  }, []);

  useEffect(() => {
    if (!user.user_id) return;

    const fetchOutlets = async () => {
      try {
        const res = await axios.get("/outlets");
        console.log("Outlets fetched:", res.data);
        setOutlets(res.data || []);
      } catch (err) {
        console.error("Failed to fetch outlets:", err.response || err.message);
        setOutlets([]);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/student/orders/${user.user_id}`);
        console.log("Orders fetched:", res.data);
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err.response || err.message);
        setOrders([]);
      }
    };

    // Fetch both in parallel
    Promise.all([fetchOutlets(), fetchOrders()]).finally(() => setLoading(false));
  }, [user]); // ✅ stable, no warning

  const enterOutlet = async (outletId) => {
    try {
      const res = await axios.get(`/menu/${outletId}`);
      setMenuItems(res.data || []);
      const outlet = outlets.find((o) => o.outlet_id === outletId);
      setSelectedOutlet(outlet);
      setOutletId(outletId);
    } catch (err) {
      console.error(err);
      alert("Failed to load menu");
    }
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.item_id === item.item_id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const increaseQty = (itemId) => {
    setCart((cart) =>
      cart.map((item) =>
        item.item_id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (itemId) => {
    setCart((cart) =>
      cart
        .map((item) =>
          item.item_id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getItemQty = (itemId) => {
    const item = cart.find((i) => i.item_id === itemId);
    return item ? item.quantity : 0;
  };

  const removeFromCart = (item_id) => setCart(cart.filter((i) => i.item_id !== item_id));

  // const placeOrder = async () => {
  //   if (cart.length === 0) return alert("Cart is empty!");
  //   try {
  //     const res = await axios.post(`/student/order`, {
  //       user_id: user.user_id,
  //       outlet_id: selectedOutlet.outlet_id,
  //       items: cart.map((i) => ({ item_id: i.item_id, quantity: i.quantity })),
  //     });
  //     alert(`Order placed! Total: ₹${res.data.total_amount}`);
  //     setCart([]);
  //     // Refresh orders after placing order
  //     const ordersRes = await axios.get(`/student/orders/${user.user_id}`);
  //     setOrders(ordersRes.data || []);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to place order");
  //   }
  // };

  if (loading) return <p>Loading outlets...</p>;

  // Outlet view
  if (selectedOutlet) {
    return (
      <div className="student-outlets-container">
        <button onClick={() => setSelectedOutlet(null)}>← Back to Outlets</button>
        <h2>{selectedOutlet.outlet_name} Menu</h2>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.item_id} className="menu-item-card">
              <h4 id="item-name">{item.name}</h4>
              <p>
                ₹{item.price} {item.availability ? "(Available)" : "(Unavailable)"}
              </p>
              {getItemQty(item.item_id) === 0 ? (
                <button onClick={() => addToCart(item)} disabled={!item.availability}>
                  Add to Cart
                </button>
              ) : (
                <div className="qty-selector">
                  <button onClick={() => decreaseQty(item.item_id)}>−</button>
                  <span>{getItemQty(item.item_id)}</span>
                  <button onClick={() => increaseQty(item.item_id)}>+</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className="cart-section">
          <h3>Cart</h3>
          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <>
              <ul>
                {cart.map((i) => (
                  <li key={i.item_id}>
                    {i.item_name} x {i.quantity} = ₹{i.price * i.quantity}
                    <button onClick={() => removeFromCart(i.item_id)}>Remove</button>
                  </li>
                ))}
              </ul>
              <p>Total: ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}</p>
              <button
                onClick={() =>
                  navigate("/checkout", {
                    state: { cart, outletId },
                  })
                }
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Outlet list view + previous orders
  return (
    <div className="student-outlets-container">
      <h1>🍴Campus Food Outlets</h1>
      {outlets.map((outlet) => (
        <div key={outlet.outlet_id} className="outlet-card">
          <h3>{outlet.outlet_name}</h3>
          <p>Location: {outlet.location}</p>
          <p>
            Hours: {outlet.opening_time} - {outlet.closing_time}
          </p>
          <button onClick={() => enterOutlet(outlet.outlet_id)}>Enter Outlet</button>
        </div>
      ))}

      {/* Previous Orders */}
      <div style={{ marginTop: "30px" }}>
        <h2>Previous Orders</h2>
        {orders.length === 0 ? (
          <p>No previous orders</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="order-card">
              <p>
                Order ID: {order.order_id} | Status: {order.status} | Total: ₹
                {order.total_amount}
              </p>
              <ul>
                {order.items?.map((i) => (
                  <li key={`${order.order_id}-${i.order_item_id}`}>
                    {i.item_name} x {i.quantity} = ₹{i.price * i.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentOutlets;
