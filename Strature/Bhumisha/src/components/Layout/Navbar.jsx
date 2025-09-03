import React from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";

export default function Navbar({ toggleSidebar }) {
  return (
    <header className="flex items-center justify-between bg-[var(--bg)] shadow px-6 py-3 sticky top-0 z-40">
      <button onClick={toggleSidebar} className="md:hidden text-[var(--text-color)]">
        <FaBars size={20} />
      </button>
      <h1 className="text-lg font-bold text-[var(--accent)]">Bhumisha Organics</h1>
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-color)]">Hello, User</span>
        <FaUserCircle size={24} className="text-[var(--accent)]" />
      </div>
    </header>
  );
}
