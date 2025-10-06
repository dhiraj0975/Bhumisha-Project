"use client";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFileInvoice,
  FaTable,
  FaBarcode,
  FaPercentage,
  FaBars,
  FaChevronLeft,
  FaHome,
  FaUser,
  FaUserFriends,
   FaUserTie,    // ✅ Vendor
  FaTractor,    // ✅ Farmer
  FaTags,       // ✅ Category
  FaBoxOpen     // ✅ Product
} from "react-icons/fa";
import { ChevronDownIcon } from "@heroicons/react/24/solid";



export default function Sidebar({ isOpen, collapsed, toggleSidebar, toggleCollapse }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // ✅ Fix: now works properly with exact path
  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
      location.pathname === path
        ? "bg-[var(--accent)] text-white"
        : "hover:bg-[var(--secondary-bg)] text-[var(--text-color)]"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[var(--bg)] shadow-lg transition-all duration-300 z-50
      ${collapsed ? "w-20" : "w-64"}
      ${isOpen ? "translate-x-0" : "-translate-x-64"}
      md:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-[var(--accent)]">
            Billing System
          </Link>
        )}
        <div className="flex gap-2">
          {/* Collapse button (desktop) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--secondary-bg)]"
          >
            <FaChevronLeft
              className={`text-[var(--text-color)] transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Close button (mobile) */}
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-[var(--text-color)]" />
          </button>
        </div>
      </div>

      {/* Sidebar Links */}
      <nav className="p-4 space-y-2 font-medium">
        {/* Dashboard */}
        <Link to="/" className={linkClass("/")}>
          <FaHome /> {!collapsed && "Dashboard"}
        </Link>

        {/* Masters Dropdown */}
        <div>
          <button
            onClick={() => toggleDropdown("masters")}
            className="flex items-center justify-between w-full px-4 py-2 rounded-md hover:bg-[var(--secondary-bg)] text-[var(--text-color)]"
          >
            <span className="flex items-center gap-3">
              <FaFileInvoice /> {!collapsed && "Masters"}
            </span>
            {!collapsed && (
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  openMenu === "masters" ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {openMenu === "masters" && !collapsed && (
            <div className="ml-6 mt-1 space-y-1">
              {/* <Link to="/vendor" className={linkClass("/vendor")}>
                <FaUserFriends /> Vendor
              </Link>

              <Link to="/farmer" className={linkClass("/farmer")}>
                <FaUser /> Farmer
              </Link> */}

              <Link to="/proforma" className={linkClass("/proforma")}>
                <FaFileInvoice /> Proforma Invoice
              </Link>

              <Link to="/gst" className={linkClass("/gst")}>
                <FaPercentage /> GST Details
              </Link>
            </div>
          )}
        </div>

        {/* Extra Links (if needed outside Masters) */}
        <Link to="/vendor" className={linkClass("/vendor")}>
          <FaUserFriends /> {!collapsed && "Vendor"}
        </Link>

        <Link to="/farmer" className={linkClass("/farmer")}>
          <FaUser /> {!collapsed && "Farmer"}
        </Link>
        <Link to="/category" className={linkClass("/category")}>
            <FaTags /> {!collapsed && "Category"}
        </Link>
        <Link to="/product" className={linkClass("/product")}>
          <FaBoxOpen /> {!collapsed && "Products"}
        </Link>
        <Link to="/purchases" className={linkClass("/purchases")}>
          <FaBoxOpen /> {!collapsed && "Purchases"}
        </Link>
        
      </nav>
    </aside>
  );
}
