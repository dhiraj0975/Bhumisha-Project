
import React from "react";
// import { Data } from "react-data-table-component";
import DataTable from "../DataTable/DataTable";

const vendorColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Vendor Name", width: 200 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "city", headerName: "City", width: 150 },
];

const vendorRows = [
  { id: 1, name: "John Enterprises", email: "john@mail.com", phone: "9876543210", city: "Delhi" },
  { id: 2, name: "Apex Supplies", email: "apex@mail.com", phone: "9123456780", city: "Mumbai" },
  { id: 3, name: "Global Traders", email: "global@mail.com", phone: "9988776655", city: "Bangalore" },
];

export default function VendorList() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Vendor List</h2>
      <DataTable rows={vendorRows} columns={vendorColumns} pageSize={5} checkboxSelection />
    </div>
  );
}
