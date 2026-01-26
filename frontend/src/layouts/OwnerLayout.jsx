import { NavLink, Outlet } from "react-router-dom";
import "./OwnerLayout.css";

function OwnerLayout() {
  return (
    <div className="owner-layout">
      {/* Sidebar */}
      <aside className="sidebar">
  <h2>🍽 Owner Panel</h2>
  <NavLink to="orders/placed">📦 Placed Orders</NavLink>
<NavLink to="orders/preparing">🔥 Preparing Orders</NavLink>
<NavLink to="orders/completed">✅ Completed Orders</NavLink>
<NavLink to="menu">📋 Menu Items</NavLink>


</aside>


      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default OwnerLayout;
