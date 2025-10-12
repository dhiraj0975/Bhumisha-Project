import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showChange, setShowChange] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between bg-[var(--bg)] shadow px-6 py-3 sticky top-0 z-40">
      {/* Mobile menu (hamburger) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden text-[var(--text-color)] text-xl leading-none"
        aria-label="Open sidebar menu"
        title="Menu"
      >
        {/* Hamburger sticker */}
        <span role="img" aria-label="menu">☰</span>
      </button>

      <h1 className="text-lg font-bold text-[var(--accent)]">Bhumisha Organics</h1>

      {/* User area */}
      <div className="flex items-center gap-3 relative">
        {!user ? (
          <div className="text-sm text-gray-600">Not logged in</div>
        ) : (
          <>
            <button className="flex items-center gap-2" onClick={() => setOpen((s) => !s)} title="Profile">
              <span className="text-sm">{user?.full_name || user?.username}</span>
              <span className="text-2xl">👤</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-12 bg-white rounded shadow p-2 w-44">
                <button onClick={() => { setShowChange(true); setOpen(false); }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Change password</button>
                <button onClick={handleLogout} className="w-full text-left px-2 py-1 rounded hover:bg-gray-100">Logout</button>
              </div>
            )}

            {showChange && <ChangePasswordModal onClose={() => setShowChange(false)} />}
          </>
        )}
      </div>
    </header>
  );
}
