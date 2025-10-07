import React from "react";

export default function Navbar({ toggleSidebar }) {
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

      <h1 className="text-lg font-bold text-[var(--accent)]">
        Bhumisha Organics
      </h1>

      {/* User area */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-color)]">Hello, User</span>
        {/* Profile sticker */}
        <span
          className="text-2xl leading-none"
          role="img"
          aria-label="user profile"
          title="Profile"
        >
          👤
        </span>
      </div>
    </header>
  );
}
