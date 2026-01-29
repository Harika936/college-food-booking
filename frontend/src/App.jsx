import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Outlets from "./pages/Outlets";
import StudentOutlets from "./pages/StudentOutlets";
import AdminMenu from './pages/AdminMenu';
import StudentMenu from './pages/StudentMenu';
import OutletOwnerMenu from './pages/OutletOwnerMenu';
import Checkout from "./pages/Checkout";
import OwnerOrders from "./pages/OwnerOrders";
import StudentInvoice from "./pages/StudentInvoice";
import OwnerLayout from "./layouts/OwnerLayout";
import ProtectedOwnerRoute from "./components/ProtectedOwnerRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



import './App.css';

function App() {
  return (
    <BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/outlets" element={<Outlets />} />
    <Route path="/student-outlets" element={<StudentOutlets />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/student/invoice/:orderId" element={<StudentInvoice />} />

    {/* Admin Routes */}
    <Route path="/admin-menu/:outletId" element={<AdminMenu />} />
    <Route path="/menu/:outletId" element={<StudentMenu />} />

    {/* Outlet Owner Routes */}
    {/* <Route path="/owner-menu" element={<OutletOwnerMenu />} /> */}

    {/* Owner Layout with nested routes */}
   {/*  Owner Layout with nested routes */}
<Route path="/owner" element={
  <ProtectedOwnerRoute>
    <OwnerLayout />
  </ProtectedOwnerRoute>
}>
  <Route index element={<Navigate to="orders/Placed" />} />
  <Route path="menu" element={<OutletOwnerMenu />} />
  <Route path="orders/:status" element={<OwnerOrders />} />
</Route>





    {/* Catch all must be last */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
  <ToastContainer position="top-right" autoClose={2000} />

</BrowserRouter>

  );
}

export default App;

