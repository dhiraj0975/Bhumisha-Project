"use client";
import React, { useState } from "react";
import { Routes, Route ,Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import LoginPage from "./pages/LoginPage";
import { useAuth } from './contexts/AuthContext';
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
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
import Invoice from "./components/PurchaseOrder/Invoice.jsx";
import SalesOrders from "./components/salesOrders/SalesOrders.jsx";
import SalesInvoice from "./components/salesOrders/SalesOrderInvoice.jsx";
// import CompanyCreate from "./components/Company/CompanyCreate.jsx";
import CompaniesPage from "./components/Company/CompaniesPage.jsx";


export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile toggle
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const { token } = useAuth();

  if (!token) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
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
      </>
    );
  }

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
            <Route path="/sales-orders" element={<SalesOrders />} />
            <Route path="/sales-invoice/:id" element={<SalesInvoice />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/company/new" element={<CompaniesPage />} />
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
