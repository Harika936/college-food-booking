const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;


// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// //DB-CONNECTION
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "9369", // your MySQL password
//   database: "college_food_app",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("❌ Database connection failed:", err);
//     process.exit(1);
//   }
//   console.log("✅ Connected to MySQL Database");
// });

// ==================== DATABASE CONNECTION ====================
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL Database");
  connection.release();
});

module.exports = db;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harikasetti936@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD // use Gmail App Password
  }
});
// Root test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

/* ========= OWNER ROUTES HERE ========= */

const ownerOrdersRoutes = require("./routes/ownerOrders");
app.use("/api", ownerOrdersRoutes(db, transporter));


// ==================== AUTH ROUTES ====================

// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password, role, phone, registerNumber } = req.body;


  console.log("📝 Register:", { name, email, role });

  if (!name || !email || !password || !role) {
  return res.status(400).json({ error: "All fields are required" });
}

if (role === "student" && !registerNumber) {
  return res.status(400).json({ error: "Register number required for students" });
}

if (role !== "student" && !phone) {
  return res.status(400).json({ error: "Phone number required" });
}


  if (!["student", "outlet_owner", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const query =
  "INSERT INTO users (name, email, password, role, phone, register_number) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
  query,
  [
    name,
    email,
    password,
    role,
    role !== "student" ? phone : null,
    role === "student" ? registerNumber : null
  ],
  (err, result) => {

        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Registration failed" });
        }

        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertId,
        });
      });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Login:", email);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0];

      // ✅ PLAIN PASSWORD CHECK
      if (password !== user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      res.json({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        outlet_id: user.outlet_id,
      });
    }
  );
});
// ==================== OUTLETS ====================

// Get all outlets
app.get("/outlets", (req, res) => {
  db.query("SELECT * FROM food_outlets ORDER BY outlet_id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get single outlet
app.get("/outlets/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;

  db.query(
    "SELECT * FROM food_outlets WHERE outlet_id = ?",
    [outlet_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "Outlet not found" });
      res.json(results[0]);
    }
  );
});

// Create a new outlet (by Outlet Owner)
app.post("/outlets", (req, res) => {
  const { outlet_name, location, opening_time, closing_time, admin_id } = req.body;

  if (!outlet_name || !location || !opening_time || !closing_time || !admin_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO food_outlets (outlet_name, location, opening_time, closing_time, admin_id) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [outlet_name, location, opening_time, closing_time, admin_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create outlet" });

    const newOutlet = {
      outlet_id: result.insertId,
      outlet_name,
      location,
      opening_time,
      closing_time,
      admin_id,
    };

    // Update user table: set outlet_id for the owner
    db.query("UPDATE users SET outlet_id = ? WHERE user_id = ?", [result.insertId, admin_id], (err2) => {
      if (err2) console.error("Failed to update user outlet_id", err2);
      res.status(201).json(newOutlet);
    });
  });
});

// Update outlet
app.put("/outlets/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;
  const { outlet_name, location, opening_time, closing_time } = req.body;

  const query =
    "UPDATE food_outlets SET outlet_name=?, location=?, opening_time=?, closing_time=? WHERE outlet_id=?";

  db.query(query, [outlet_name, location, opening_time, closing_time, outlet_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Outlet not found" });
    res.json({ message: "Outlet updated" });
  });
});

// Delete outlet
app.delete("/outlets/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;

  db.query("DELETE FROM food_outlets WHERE outlet_id = ?", [outlet_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Outlet not found" });
    res.json({ message: "Outlet deleted" });
  });
});

/// ==================== MENU ====================

// Get menu items for a specific outlet
app.get("/menu/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;

  db.query(
    "SELECT * FROM menu_items WHERE outlet_id = ?",
    [outlet_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Remove category because it does not exist in your table
      const items = results.map((item) => ({
        item_id: item.item_id,
        name: item.item_name,
        price: parseFloat(item.price),
        availability: !!item.availability,
        outlet_id: item.outlet_id,
      }));

      res.json(items);
    }
  );
});

app.post("/menu", (req, res) => {
  const { outlet_id, name, price, availability } = req.body;

  if (!outlet_id || !name || !price) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const query =
    "INSERT INTO menu_items (outlet_id, item_name, price, availability) VALUES (?, ?, ?, ?)";
  const values = [outlet_id, name, parseFloat(price), availability ? 1 : 0];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Insert failed:", err);
      return res.status(500).json({ error: "Insert failed" });
    }
    res.status(201).json({
      item_id: result.insertId,
      outlet_id,
      name,
      price: parseFloat(price),
      availability: !!availability,
    });
  });
});



// Update a menu item
app.put("/menu/:item_id", (req, res) => {
  const { item_id } = req.params;
  const { name, price, availability } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const query =
    "UPDATE menu_items SET item_name = ?, price = ?, availability = ? WHERE item_id = ?";
  const values = [name, parseFloat(price), availability ? 1 : 0, item_id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    res.json({ message: "Menu item updated successfully" });
  });
});

// Delete a menu item
app.delete("/menu/:item_id", (req, res) => {
  const { item_id } = req.params;

  db.query(
    "DELETE FROM menu_items WHERE item_id = ?",
    [item_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "Menu item deleted successfully" });
    }
  );
});
// Get outlet by owner/admin ID
app.get("/outlets/owner/:owner_id", (req, res) => {
  const { owner_id } = req.params;

  db.query(
    "SELECT * FROM food_outlets WHERE admin_id = ?",
    [owner_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.json(null); // No outlet yet
      res.json(results[0]);
    }
  );
});

app.post("/student/order", (req, res) => {
  const { user_id, outlet_id, items } = req.body; // items = [{ item_id, quantity }]

  if (!user_id || !outlet_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  // Get item prices from DB
  const itemIds = items.map(i => i.item_id);
  db.query(`SELECT * FROM menu_items WHERE item_id IN (${itemIds.join(",")})`, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    let total = 0;
    items.forEach(i => {
      const menu = results.find(m => m.item_id === i.item_id);
      total += parseFloat(menu.price) * i.quantity;
    });

    // Insert into orders
    db.query(
      "INSERT INTO orders (user_id, outlet_id, total_amount, status) VALUES (?, ?, ?, 'Placed')"
,
      [user_id, outlet_id, total],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to create order" });
        const orderId = result.insertId;

        // Insert into order_items
        const orderItemsValues = items.map(i => {
          const menu = results.find(m => m.item_id === i.item_id);
          return [orderId, i.item_id, i.quantity, menu.price];
        });

        db.query(
          "INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ?",
          [orderItemsValues],
          (err2) => {
            if (err2) return res.status(500).json({ error: "Failed to add order items" });
            res.status(201).json({ message: "Order placed successfully", order_id: orderId, total_amount: total });
          }
        );
      }
    );
  });
});
app.get("/student/orders/:user_id", (req, res) => {
  const { user_id } = req.params;

  db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY order_time DESC", [user_id], (err, orders) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.order_id);
    db.query(
      `SELECT oi.*, mi.item_name 
       FROM order_items oi 
       JOIN menu_items mi ON oi.item_id = mi.item_id 
       WHERE oi.order_id IN (${orderIds.join(",")})`,
      (err2, items) => {
        if (err2) return res.status(500).json({ error: "Database error" });

        const result = orders.map(order => ({
          ...order,
          items: items.filter(i => i.order_id === order.order_id)
        }));

        res.json(result);
      }
    );
  });
});


app.get("/student/menu/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;

  db.query("SELECT * FROM menu_items WHERE outlet_id = ?", [outlet_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const items = results.map(item => ({
      item_id: item.item_id,
      name: item.item_name,
      price: parseFloat(item.price),
      availability: !!item.availability,
    }));

    res.json(items);
  });
});
app.get("/student/outlets", (req, res) => {
  db.query("SELECT * FROM food_outlets ORDER BY outlet_id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ==================== ORDERS ====================

app.post("/orders", (req, res) => {
  const { user_id, outlet_id, total_amount, items } = req.body;

  if (!user_id || !outlet_id || !items || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderSql =
    "INSERT INTO orders (user_id, outlet_id, total_amount) VALUES (?, ?, ?)";

  db.query(orderSql, [user_id, outlet_id, total_amount], (err, result) => {
    if (err) {
      console.error("Order insert error:", err);
      return res.status(500).json({ message: "Order creation failed" });
    }

    const orderId = result.insertId; // ⭐ KEY FIX

    const itemSql =
      "INSERT INTO order_items (order_id, item_id, quantity, price) VALUES ?";

    const values = items.map(item => [
      orderId,
      item.item_id,
      item.quantity,
      item.price
    ]);

    db.query(itemSql, [values], err2 => {
      if (err2) {
        console.error("Order items insert error:", err2);
        return res.status(500).json({ message: "Order items failed" });
      }

      // ✅ RETURN ORDER ID
      res.status(201).json({
        success: true,
        orderId: orderId
      });
    });
  });
});

app.get("/orders/:user_id", (req, res) => {
  db.query(
    "SELECT * FROM orders WHERE user_id=? ORDER BY order_time DESC",
    [req.params.user_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});
//==================== OWNER ROUTES ====================

app.get("/api/owner/orders/:outlet_id", (req, res) => {
  const { outlet_id } = req.params;

  console.log(`🔍 Fetching orders for outlet_id: ${outlet_id}`);

  // First, get all orders for this outlet
  const orderQuery = `
    SELECT 
      o.order_id,
      o.user_id,
      o.outlet_id,
      o.total_amount,
      o.status,
      o.order_time,
      u.name as student_name,
      u.email as student_email
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

    // If no orders, return empty array
    if (orders.length === 0) {
      return res.json([]);
    }

    // Now fetch items for each order
    let completedOrders = 0;

    orders.forEach((order, index) => {
      const itemQuery = `
        SELECT 
          oi.order_item_id,
          oi.order_id,
          oi.item_id,
          oi.quantity,
          oi.price,
          i.name as item_name
        FROM order_items oi
        LEFT JOIN items i ON oi.item_id = i.item_id
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

//Invoice receipt
// ================= STUDENT INVOICE =================
app.get("/api/student/invoice/:order_id", (req, res) => {
  const { order_id } = req.params;

  const orderQuery = `
    SELECT 
      o.order_id,
      o.total_amount,
      o.status,
      o.order_time,
      f.outlet_name
    FROM orders o
    JOIN food_outlets f ON o.outlet_id = f.outlet_id
    WHERE o.order_id = ?
  `;

  db.query(orderQuery, [order_id], (err, orderResult) => {
    if (err) return res.status(500).json({ error: err });
    if (orderResult.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const itemsQuery = `
      SELECT 
        mi.item_name,
        oi.quantity,
        oi.price
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.order_id = ?
    `;

    db.query(itemsQuery, [order_id], (err2, items) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({
        ...orderResult[0],
        items
      });
    });
  });
});




// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
