
const express = require("express");
const router = express.Router();

module.exports = (db, transporter) => {

  // ================= GET OWNER ORDERS BY OUTLET_ID =================
  router.get("/owner/orders/:outlet_id", (req, res) => {
    const { outlet_id } = req.params;

    console.log(`🔍 Fetching orders for outlet_id: ${outlet_id}`);

    // Get orders for this outlet
    const orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.outlet_id,
        o.total_amount,
        TRIM(LOWER(o.status)) AS status,
        o.order_time,
        u.name AS student_name,
        u.email AS student_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.outlet_id = ?
      ORDER BY o.order_time DESC
 `;

    db.query(orderQuery, [outlet_id], (err, orders) => {
      if (err) {
        console.error("❌ Error fetching orders:", err);
        return res.status(500).json({ error: "Failed to fetch orders" });
      }

      console.log(`✅ Found ${orders.length} orders for outlet ${outlet_id}`);

      if (orders.length === 0) {
        return res.json([]);
      }

      // Fetch items for each order
      let completedOrders = 0;

      orders.forEach((order, index) => {
        const itemQuery = `
          SELECT 
            oi.order_item_id,
            oi.order_id,
            oi.item_id,
            oi.quantity,
            oi.price,
            mi.item_name
          FROM order_items oi
          LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
          WHERE oi.order_id = ?
        `;

        db.query(itemQuery, [order.order_id], (err2, items) => {
          if (err2) {
            console.error(`❌ Error fetching items for order ${order.order_id}:`, err2);
            orders[index].items = [];
          } else {
            console.log(`📦 Order ${order.order_id} has ${items.length} items`);
            orders[index].items = items;
          }

          completedOrders++;

          // Once all orders have their items, send the response
          if (completedOrders === orders.length) {
            console.log(`✅ Sending ${orders.length} orders with items`);
            res.json(orders);
          }
        });
      });
    });
  });

  // ================= UPDATE ORDER STATUS =================
  router.put("/owner/orders/:order_id/status", (req, res) => {
    const { order_id } = req.params;
    const rawStatus = req.body.status;
    const status = rawStatus.trim().toLowerCase();


    console.log(`🔄 Updating order ${order_id} to: ${status}`);

    // Validate status
    const validStatuses = ['placed', 'preparing', 'ready', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    db.query(
     "UPDATE orders SET status=? WHERE order_id=?",
      [status, order_id],
      (err, result) => {
        if (err) {
          console.error("❌ Update error:", err);
          return res.status(500).json({ error: "Update failed" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Order not found" });
        }

        console.log(`✅ Order ${order_id} updated to ${status}`);

        // Send email only when status is "Ready" or "Completed"
        if (status === "ready" || status === "completed") {
          const emailQuery = `
            SELECT u.email, u.name, o.order_id
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            WHERE o.order_id = ?
          `;

          db.query(emailQuery, [order_id], (err2, result) => {
            if (err2 || result.length === 0) {
              console.error("❌ Email fetch failed:", err2);
              return res.json({ message: "Order updated but email failed" });
            }

            const { email, name } = result[0];

            const emailSubject = status === "ready" 
              ? "🍽️ Your Order is Ready!" 
              : "✅ Order Completed!";

            const emailBody = status === "ready"
              ? `<h3>Hello ${name},</h3>
                 <p>Your order <b>#${order_id}</b> is</p>
                 <h2>✅ READY TO COLLECT</h2>
                 <p>Please come and pick it up!</p>`
              : `<h3>Hello ${name},</h3>
                 <p>Your order <b>#${order_id}</b> has been</p>
                 <h2>✅ COMPLETED</h2>
                 <p>Thank you for your order!</p>`;

            transporter.sendMail(
              {
                from: "College Food App <harikasetti936@gmail.com>",
                to: email,
                subject: emailSubject,
                html: emailBody
              },
              err3 => {
                if (err3) {
                  console.error("❌ Email send failed:", err3);
                  return res.json({ 
                    message: "Order updated but email failed",
                    success: true 
                  });
                }

                console.log(`📧 Email sent to ${email}`);
                res.json({ 
                  message: "Order updated & email sent",
                  success: true 
                });
              }
            );
          });
        } else {
          // For Placed/Preparing status, no email needed
          res.json({ 
            message: "Order status updated",
            success: true 
          });
        }
      }
    );
  });

  return router;
};

