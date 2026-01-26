import React, { useState } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  role: "student",
  registerNumber: "",
  phone: "",
});


  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    setMessage("✅ Registration successful! Redirecting to login...");
    setMessageType("success");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (err) {
    console.error("Registration error:", err);
    setMessage(err.message || "Registration failed. Please try again.");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>

        {message && (
          <div className={messageType === "success" ? "success-message" : "error-message"}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="outlet_owner">Outlet Owner</option>
            <option value="admin">Admin</option>
          </select>
          {formData.role === "student" && (
              <input
                name="registerNumber"
                placeholder="Register Number"
                value={formData.registerNumber}
                onChange={handleChange}
                required
              />
            )}
            {formData.role !== "student" && (
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            )}

          <button type="submit">{loading ? "Registering..." : "Register"}</button>
          <div className="login-link">
          <p>Already have an account?</p>
          <button className="btn-login" onClick={() => navigate("/login")}>
            ← Back to Login
          </button>
          </div>
        </form>
      </div>
    </div>
    
  );
}

export default Register;
