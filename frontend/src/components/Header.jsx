import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );


  const navClass = ({ isActive }) =>
    `text-xs uppercase tracking-widest pb-1 border-b transition-colors duration-200 ${isActive
      ? "text-gold-bright border-gold"
      : "text-warm border-transparent hover:text-gold-bright hover:border-gold"
    }`;


  const handleLogout = () => {

    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update UI immediately
    setIsLoggedIn(false);

    // Navigate to login page
    navigate("/login");

  };


  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-line">

      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">


        <Link
          to="/"
          className="flex items-center gap-2 font-display text-2xl text-gold-bright"
        >
          <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
            <path
              d="M16 6h8l3 4-3 3H16l-3-3 3-4Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <rect
              x="13"
              y="14"
              width="14"
              height="20"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M13 22c3 2 8 2 14 0"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>

          aromiq<span className="text-gold">.lk</span>
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


          <button
            aria-label="Search"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-gold hover:border-gold hover:text-gold-bright transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>



          <Link
            to="/cart"
            aria-label="Cart"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-gold hover:border-gold hover:text-gold-bright transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.6L21 8H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="21" r="1.3" fill="currentColor" /><circle cx="18" cy="21" r="1.3" fill="currentColor" /></svg>
          </Link>



          {isLoggedIn ? (

            <div className="flex items-center gap-3">

              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
              >
                My Account
              </Link>


              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
              >
                Sign Out
              </button>

            </div>


          ) : (

            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-xs uppercase tracking-widest border border-line text-gold hover:border-gold hover:text-gold-bright transition"
            >
              Sign In
            </button>

          )}



          <button
            aria-label="Menu"
            className="md:hidden text-gold"
          >
            ☰
          </button>


        </div>

      </div>

    </header>
  );
}