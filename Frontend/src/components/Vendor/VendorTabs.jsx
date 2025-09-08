  import React, { useEffect, useState } from "react";
  import { useSelector, useDispatch } from "react-redux"; // Add useDispatch
  import { motion } from "framer-motion";
  import { Users, ClipboardList } from "lucide-react";
  import VendorRegistration from "./VendorRegistration";
  import VendorList from "./VendorList";
  import { clearEditingVendor } from "../../features/vendor/vendorSlice"; // Import clearEditingVendor

  const tabs = [
    { id: "register", label: "Vendor Registration", icon: <Users size={20} /> },
    { id: "list", label: "Vendor List", icon: <ClipboardList size={20} /> },
  ];

  const VendorTabs = () => {
    const dispatch = useDispatch(); // Add dispatch
    const [activeTab, setActiveTab] = useState("register");
    const [vendors, setVendors] = useState([]);
    const { editingVendor } = useSelector((state) => state.vendors);

    // When editing starts, jump to registration tab so the form shows prefilled
    useEffect(() => {
      if (editingVendor) {
        setActiveTab("register");
      }
    }, [editingVendor]);

    // Handle tab change and clear editingVendor when switching to list
    const handleTabChange = (tabId) => {
      setActiveTab(tabId);
      if (tabId === "list") {
        dispatch(clearEditingVendor()); // Clear editingVendor when switching to Vendor List
      }
    };

    // const handleAddVendor = (vendor) => {
    //   setVendors([...vendors, vendor]);
    //   setActiveTab("list"); // Auto switch to list
    // };

    const handleAddVendor = () => {
  // Just switch to the list tab, the data will be fetched automatically
  setActiveTab("list");
};

    return (
      <div className="mx-auto mt-2 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        {/* Tabs */}
        <div className="flex relative bg-white rounded-t-3xl overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-base font-semibold transition-all duration-300 relative
                ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => handleTabChange(tab.id)} // Use handleTabChange
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content with animation */}
        <div className="p-3 min-h-[400px] bg-white">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === "register" && (
              <VendorRegistration onAddVendor={handleAddVendor} />
            )}
            {activeTab === "list" && <VendorList vendors={vendors} />}
          </motion.div>
        </div>
      </div>
    );
  };

  export default VendorTabs;