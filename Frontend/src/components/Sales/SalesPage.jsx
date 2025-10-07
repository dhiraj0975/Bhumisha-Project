// src/pages/sales/SalesPage.jsx
import { useState } from "react";
import SalesList from "./SalesList";
import SalesForm from "./SalesForm";
import SalesDetailsPanel from "./SalesDetailsPanel";

export default function SalesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSale, setEditingSale] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const onCreate = () => {
    setEditingSale(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onEdit = (sale) => {
    setEditingSale(sale);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmitted = () => {
    setEditingSale(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <SalesForm sale={editingSale} onSubmitted={onSubmitted} />
      <SalesList key={refreshKey} onEdit={onEdit} onCreate={onCreate} onDetails={setDetailsId} />
      {detailsId && <SalesDetailsPanel id={detailsId} onClose={() => setDetailsId(null)} />}
    </div>
  );
}
