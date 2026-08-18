import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    const linkClass = ({ isActive }) =>
        `block py-2 px-4 rounded transition-colors duration-200 ${isActive ? 'bg-gold-bright text-ink' : 'text-warm hover:bg-gold-bright hover:text-ink'
        }`;

    return (
        <aside className="fixed top-20 left-0 w-48 h-full bg-ink/90 backdrop-blur-md border-r border-line p-4 hidden md:block">
            <nav className="flex flex-col gap-2">
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                <NavLink to="/address" className={linkClass}>Address</NavLink>
                <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>
                <NavLink to="/cart" className={linkClass}>Cart</NavLink>
                <NavLink to="/checkout" className={linkClass}>Checkout</NavLink>
                <NavLink to="/orders" className={linkClass}>Orders</NavLink>
                <NavLink to="/admin-dashboard" className={linkClass}>Admin Dashboard</NavLink>
                <NavLink to="/admin-orders" className={linkClass}>Admin Orders</NavLink>
            </nav>
        </aside>
    );
}
