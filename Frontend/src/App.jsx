"use client";
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import Dashboard from "./Pages/Dashboard";
import VendorManagement from "./Pages/VendorManagement.jsx";
import FarmerRegistrationPage from "./Pages/FarmerRegistrationPage";
import ProformaInvoice from "./Pages/ProformaInvoice";
import Categories from "./components/categories/Categories";
import Products from "./Pages/products/Products";
import Purchases from "./components/purchase/Purchases.jsx";
import PurchaseEdit from "./Pages/purchase/PurchaseEdit.jsx";
import PurchaseView from "./Pages/purchase/PurchaseView.jsx";
import CustomersPage from "./components/customers/CustomersPage.jsx";
import SalesPage from './components/Sales/SalesPage';
import PurchaseOrders from "./components/PurchaseOrder/PurchaseOrders.jsx";


export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile toggle
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen bg-[var(--secondary-bg)]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        toggleCollapse={toggleCollapse}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300
        ${collapsed ? "md:ml-20" : "md:ml-64"} ml-0`}
      >
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Body / Pages */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/vendor" element={<VendorManagement />} />
            <Route path="/farmer" element={<FarmerRegistrationPage />} />
            <Route path="/proforma" element={<ProformaInvoice />} />
            <Route path="/category" element={<Categories />} />
            <Route path="/product" element={<Products/>} />
           <Route path="/purchases" element={<Purchases />} />
           <Route path="/purchases/edit/:poId" element={<PurchaseEdit />} />
           <Route path="/purchases/view/:poId" element={<PurchaseView />} />
           <Route path="/customers" element={<CustomersPage />} />
           <Route path="/sales" element={<SalesPage />} />
            <Route path="/po-order" element={<PurchaseOrders />} />

          </Routes>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
