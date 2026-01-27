const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harikasetti936@gmail.com",
    pass: "ehim qrcb stvn mvym"
  }
});

module.exports = transporter;
