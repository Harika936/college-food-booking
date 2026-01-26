// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "harikasetti936@gmail.com",
//     pass: "giis kpbd esrp gpra"
//   }
// });

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Mailer error:", error);
//   } else {
//     console.log("✅ Mailer ready to send emails");
//   }
// });

// module.exports = transporter;

const nodemailer = require("nodemailer");

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "harikasetti936@gmail.com",
    pass: "giis kpbd esrp gpra"  // ⬅️ Replace with your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error.message);
    console.log("\n📧 Email Setup Instructions:");
    console.log("1. Go to: https://myaccount.google.com/security");
    console.log("2. Enable 2-Step Verification");
    console.log("3. Go to: https://myaccount.google.com/apppasswords");
    console.log("4. Generate App Password for 'Mail'");
    console.log("5. Copy the 16-character password");
    console.log("6. Replace YOUR_APP_PASSWORD_HERE in mailer.js\n");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

module.exports = transporter;