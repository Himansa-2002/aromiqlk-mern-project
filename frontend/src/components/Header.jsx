import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { itemCount, openCart, resetCart } = useCart();
  const { isLoggedIn, logout } = useAuth();

  const navClass = ({ isActive }) =>
    `text-xs uppercase tracking-widest pb-1 border-b transition-colors duration-200 ${isActive
      ? "text-gold-bright border-gold"
      : "text-warm border-transparent hover:text-gold-bright hover:border-gold"
    }`;

  const handleLogout = () => {
    resetCart();
    logout(true);
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-line">
    <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">

   <Link
      to="/"
      className="flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
        <img
          src="/images/logo.png"
          alt="Aromiq.lk"
          className="w-[80px] h-[80px] max-w-none object-contain"
        />
      </div>

      <span className="font-display text-2xl text-gold-bright tracking-wide">
        aromiq<span className="text-gold">.lk</span>
      </span>
    </Link>

        <nav className="hidden md:flex gap-10">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>

          <NavLink to="/about" className={navClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
        {searchOpen ? (
        <form
          onSubmit={handleSearch}
          className="flex items-center border border-line bg-panel"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="w-48 h-9 px-3 bg-transparent text-sm text-white outline-none placeholder:text-muted"
          />

          <button
            type="submit"
            aria-label="Submit search"
            className="w-9 h-9 flex items-center justify-center text-gold hover:text-gold-bright transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M21 21l-4.3-4.3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            aria-label="Close search"
            className="w-9 h-9 flex items-center justify-center text-muted hover:text-gold transition"
          >
            ×
          </button>
        </form>
      ) : (
        <button
          type="button"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-gold hover:border-gold hover:text-gold-bright transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M21 21l-4.3-4.3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}


          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative w-9 h-9 flex items-center justify-center rounded-full border border-line text-gold hover:border-gold hover:text-gold-bright transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.6L21 8H7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="21" r="1.3" fill="currentColor" />
              <circle cx="18" cy="21" r="1.3" fill="currentColor" />
            </svg>

            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-bright px-1 text-[10px] font-bold text-ink">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
              >
                My Account
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
            >
              Sign In
            </button>
          )}

          <button type="button" aria-label="Menu" className="md:hidden text-gold">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}