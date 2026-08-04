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
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminOrders from "./pages/admin/AdminOrdersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import CategoryPage from "./pages/CategoryPage.jsx";
import BrandPage from "./pages/BrandPage.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./Admin/pages/AdminDashboard.jsx";
import AdminProducts from "./admin/pages/AdminProducts.jsx";
import AdminCategories from "./admin/pages/AdminCategories.jsx";
import AdminBrands from "./admin/pages/AdminBrands.jsx";
import AdminCollections from "./admin/pages/AdminCollections.jsx";
import AdminBanners from "./admin/pages/AdminBanners.jsx";
import AdminReviews from "./admin/pages/AdminReviews.jsx";
import AdminMessages from "./admin/pages/AdminMessages.jsx";
import AdminNewsletter from "./admin/pages/AdminNewsletter.jsx";

function SiteLayout() {
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
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="*" element={<NotFoundPage />} />

        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/brand/:slug" element={<BrandPage />} />
        <Route path="/collection/:slug" element={<CollectionPage />} />

      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin panel — no site header/footer, its own layout with sidebar nav.
          NOTE: not auth-protected yet — that depends on the shared auth
          middleware/admin-layout piece, coordinate with the teammate handling
          Module 1 (Authentication) before this goes anywhere near production. */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
      </Route>

      {/* Everything else is the public site, wrapped in Header/Footer */}
      <Route path="/*" element={<SiteLayout />} />
    </Routes>
  );
}
