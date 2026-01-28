import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./StudentInvoice.css";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;


function StudentInvoice() {
  const { orderId } = useParams();
  const [invoice, setInvoice] = useState(null);


useEffect(() => {
  if (!orderId) return; // ⛔ STOP API CALL
  
  axios.get(`/api/student/invoice/${orderId}`)

    .then(res => setInvoice(res.data))
    .catch(err => console.error(err));
}, [orderId]);

  
  if (!invoice) return <p>Loading receipt...</p>;

  return (
    <div className="invoice-container">
      <h2>🧾 Order Receipt</h2>

      <p><b>Order ID:</b> #{invoice.order_id}</p>
      <p><b>Outlet:</b> {invoice.outlet_name}</p>
      <p><b>Date:</b> {new Date(invoice.order_time).toLocaleString()}</p>
      <p><b>Status:</b> {invoice.status}</p>

      <hr />

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i}>
              <td>{item.item_name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total Paid: ₹{invoice.total_amount}</h3>

      <button onClick={() => window.print()}>
        🖨️ Print Receipt
      </button>
    </div>
  );
}

export default StudentInvoice;
