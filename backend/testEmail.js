const transporter = require("./mailer");

console.log("🧪 Testing email...");

transporter.sendMail(
  {
    from: "College Food App <harikasetti936@gmail.com>",
    to: "harikasetti936@gmail.com", // Send to yourself
    subject: "🧪 Test Email - College Food App",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Email Setup Successful!</h2>
          <p>If you're reading this, your email configuration is working perfectly.</p>
          <p style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
            🎉 Order notifications will now be sent to students!
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This is a test email from your College Food App backend.
          </p>
        </div>
      </div>
    `
  },
  (error, info) => {
    if (error) {
      console.error("❌ Email failed:", error.message);
      console.log("\n💡 Common issues:");
      console.log("1. Check if you're using App Password (not regular password)");
      console.log("2. Verify 2-Step Verification is enabled");
      console.log("3. Make sure the password has no spaces");
      console.log("4. Try generating a new App Password\n");
    } else {
      console.log("✅ Email sent successfully!");
      console.log("📧 Message ID:", info.messageId);
      console.log("📬 Check your inbox at: harikasetti936@gmail.com\n");
    }
    process.exit();
  }
);