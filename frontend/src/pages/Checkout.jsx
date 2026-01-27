import React from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;


function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state || !state.cart || state.cart.length === 0) {
    return <p>No order data</p>;
  }

  const { cart } = state;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <p>User not logged in</p>;
  }

  // Ensure all items belong to the same outlet
  const outletIds = [...new Set(cart.map(item => item.outlet_id))];
  if (outletIds.length !== 1) {
    return <p>Error: Cart contains items from multiple outlets.</p>;
  }

  const outletId = outletIds[0]; // ✅ Safe outlet_id
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    try {
      const payload = {
        user_id: user.user_id,
        outlet_id: outletId,
        total_amount: totalAmount,
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await axios.post(`${API_URL}/orders`, payload);

      if (!res.data.orderId) {
        alert("Order placed but invoice failed");
        return;
      }

      console.log("Order placed successfully:", res.data);
      // Redirect to invoice page
      navigate(`/student/invoice/${res.data.orderId}`);
    } catch (err) {
      console.error("Order placement failed:", err);
      alert("Order failed");
    }
  };

  return (
    <div className="student-outlets-container">
      <h2>Checkout</h2>

      <p style={{ fontWeight: "bold", fontSize: "18px" }}>
        Total Amount: ₹{totalAmount.toFixed(2)}
      </p>

      <button onClick={placeOrder}>Confirm Order</button>
    </div>
  );
}

export default Checkout;
