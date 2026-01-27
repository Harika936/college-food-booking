import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await axios.post(`${API_URL}/login`, formData);

    const user = res.data; // ✅ FIX HERE

    // Store user info
    localStorage.setItem("user", JSON.stringify(user));

    setMessage("Login successful! Redirecting...");
    setMessageType("success");

    setTimeout(() => {
      if (user.role === "admin") {
        navigate("/outlets");
      } else if (user.role === "outlet_owner") {
        navigate("/owner");
      } else if (user.role === "student") {
        navigate("/student-outlets");
      }
    }, 1500);

  } catch (err) {
    console.error("Login error:", err);
    setMessage(
      err?.response?.data?.error || "Invalid credentials. Please try again."
    );
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back!</h1>
          <p className="login-subtitle">Login to QuickServe Campus</p>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-message" : "error-message"}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="register-link">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;