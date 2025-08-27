import React from "react";
import DataTable from "../DataTable/DataTable";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function FarmerList({ farmers, onEdit, onDelete }) {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "fatherName", headerName: "Father Name", flex: 1 },
    { field: "district", headerName: "District", flex: 1 },
    { field: "tehsil", headerName: "Tehsil", flex: 1 },
    { field: "halka", headerName: "Patwari Halka", flex: 1 },
    { field: "village", headerName: "Village", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
    { field: "khasara", headerName: "Khasara No.", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton
            color="primary"
            onClick={() => onEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => onDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Farmer List</h2>
      <DataTable rows={farmers} columns={columns} />
    </div>
  );
}
