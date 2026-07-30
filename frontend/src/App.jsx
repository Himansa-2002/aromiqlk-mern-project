import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Login from "./pages/auth/LoginPage.jsx";
import Register from "./pages/auth/RegisterPage.jsx";
import ForgotPassword from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPassword from "./pages/auth/ResetPasswordPage.jsx";
import Dashboard from "./pages/customer/DashboardPage.jsx";
import Profile from "./pages/customer/ProfilePage.jsx";
import Address from "./pages/customer/AddressPage.jsx";
import Wishlist from "./pages/customer/WishlistPage.jsx";
import Cart from "./pages/customer/CartPage.jsx";
import Checkout from "./pages/customer/CheckoutPage.jsx";
import OrderSuccess from "./pages/customer/OrderSuccessPage.jsx";
import Orders from "./pages/customer/OrdersPage.jsx";
import OrderDetails from "./pages/customer/OrderDetailsPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboardPage.jsx";
import AdminOrders from "./pages/admin/AdminOrdersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";


export default function App() {
  return (
    <div className="bg-ink text-warm font-body">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/address" element={<Address />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
