import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <h2>🍽️ QuickServe Campus</h2>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Order Food Smartly on Campus</h1>
        <p>
          Skip long queues. Order food online from campus canteens anytime.
        </p>

        <div className="hero-buttons">
          <Link to="/login" className="btn">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline">
            Register
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why QuickServe Campus?</h2>

        <ul>
          <li> Online food ordering for students</li>
          <li> Reduced crowd and waiting time</li>
          <li> Admin dashboard for canteen management</li>
          <li> Secure login for students & admins</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2025 QuickServe Campus | Developed for College Project
      </footer>
    </>
  );
}

export default Home;

