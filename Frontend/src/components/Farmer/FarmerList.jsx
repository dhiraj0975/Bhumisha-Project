import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFarmers, deleteFarmer } from "../../features/farmers/farmerSlice";
import DataTable from "../DataTable/DataTable";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function FarmerList({ onEdit }) {
  const dispatch = useDispatch();
  const { list: farmers, loading } = useSelector((state) => state.farmers);

  useEffect(() => {
    dispatch(fetchFarmers());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteFarmer(id));
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "father_name", headerName: "Father Name", flex: 1 },
    { field: "district", headerName: "District", flex: 1 },
    { field: "tehsil", headerName: "Tehsil", flex: 1 },
    { field: "patwari_halka", headerName: "Patwari Halka", flex: 1 },
    { field: "village", headerName: "Village", flex: 1 },
    { field: "contact_number", headerName: "Contact", flex: 1 },
    { field: "khasara_number", headerName: "Khasara No.", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton color="primary" onClick={() => onEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  if (loading) return <p>Loading farmers...</p>;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Farmer List</h2>
      <DataTable rows={farmers} columns={columns} />
    </div>
  );
}
