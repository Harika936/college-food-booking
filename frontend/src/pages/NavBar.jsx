import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        borderRadius: "0 0 15px 15px",
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>🍳 Chef's Pantry</div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Home
        </Link>
        <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>
          Register
        </Link>
        <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
          Login
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
