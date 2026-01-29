import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;



function OwnerOrders() {
  const { status } = useParams();
  const [orders, setOrders] = useState([]);
  const admin = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = useCallback(async () => {
    if (!admin?.outlet_id) return;

    try {
      const res = await axios.get(
  `/api/owner/orders/${admin.outlet_id}`
);

      console.log("Fetched orders:", res.data); // debug
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response || err.message);
    }
  }, [admin?.outlet_id]);

  useEffect(() => {
  (async () => {
    await fetchOrders();
  })();

  const interval = setInterval(fetchOrders, 10000);
  return () => clearInterval(interval);
}, [fetchOrders]);


//   const updateStatus = async (orderId, newStatus) => {
//   try {
//     await axios.put(
//       `http://localhost:5000/api/owner/orders/${orderId}/status`,
//       { status: newStatus }
//     );

//     toast.success(`Order moved to ${newStatus}`);
//     fetchOrders();
//     setOrders(prevOrders =>
//       prevOrders.filter(order => order.order_id !== orderId)
//     );

//   } catch (err) {
//     toast.error("Failed to update order status");
//     console.error("Update error:", err.response || err.message);
//   }
// };
const updateStatus = async (orderId, newStatus) => {
  try {
    await axios.put(
  `/api/owner/orders/${orderId}/status`,
  { status: newStatus }
);


    toast.success(`Order moved to ${newStatus}`);
    fetchOrders(); // enough

  } catch (err) {
    toast.error("Failed to update order status");
    console.error("Update error:", err.response || err.message);
  }
};
console.log("All orders received:", orders.map(o => ({ id: o.order_id, status: o.status })));
console.log("Filtering for status:", status);


  // use "Placed", "Preparing", "Ready", "Completed" consistently
const filteredOrders = orders.filter(order => {
  if (!order.status) return false; // skip if null
  return order.status.toLowerCase() === status?.toLowerCase();
});



  return (
    <div>
      <h2>{status} Orders</h2>
      {filteredOrders.length === 0 && <p>No orders</p>}
      {filteredOrders.map(order => (
        <div key={order.order_id} className="order-card">
          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Student:</b> {order.student_name || "N/A"}</p>
          <p><b>Total:</b> ₹{order.total_amount}</p>

          {order.items?.map(item => (
            <p key={item.order_item_id}>
              {item.item_name} x {item.quantity} - ₹{item.price}
            </p>
          ))}

          {status?.toLowerCase() === "placed" && (
            <button onClick={() => updateStatus(order.order_id, "Preparing")}>
              Order Taken
            </button>
          )}

          {status?.toLowerCase() === "preparing" && (
            <button onClick={() => updateStatus(order.order_id, "Completed")}>
              Prepared
            </button>
          )}

          {status?.toLowerCase() === "completed" && (
            <button onClick={() => updateStatus(order.order_id, "Archived")}>
              Archive Order
            </button>
          )}

        </div>
      ))}
    </div>
  );
}

export default OwnerOrders;




