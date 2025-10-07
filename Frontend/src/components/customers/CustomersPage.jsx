// // src/pages/customers/CustomersPage.jsx
// import { useEffect, useMemo, useState } from "react";
// import customersAPI from "../../axios/customerAPI";
// import { toast } from "react-toastify";

// const emptyForm = {
//   name: "",
//   email: "",
//   phone: "",
//   address: "",
//   status: "Active",
// };

// export default function CustomersPage() {
//   const [form, setForm] = useState(emptyForm);
//   const [editId, setEditId] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");
//   const [q, setQ] = useState("");
//   const [showForm, setShowForm] = useState(false); // NEW: controls visibility

//   const filtered = useMemo(() => {
//     const term = q.toLowerCase();
//     return rows.filter((r) =>
//       [r.name, r.email, r.phone, r.address, r.status]
//         .filter(Boolean)
//         .some((v) => String(v).toLowerCase().includes(term))
//     );
//   }, [rows, q]);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const { data } = await customersAPI.getAll();
//       setRows(Array.isArray(data) ? data : []);
//     } catch (e) {
//       setErr("Failed to load customers");
//       toast.error("Failed to load customers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   const validate = () => {
//     if (!form.name.trim()) return "Name is required";
//     if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
//     if (form.phone && !/^\d{7,15}$/.test(form.phone)) return "Invalid phone";
//     return "";
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const v = validate();
//     if (v) {
//       setErr(v);
//       toast.error(v);
//       return;
//     }
//     setErr("");
//     setLoading(true);
//     try {
//       if (editId) {
//         await customersAPI.update(editId, form);
//         toast.success("Customer updated");
//       } else {
//         const res = await customersAPI.create(form);
//         const status = res?.status;
//         toast.success(status === 201 ? "Customer created" : "Customer created");
//       }
//       await fetchAll();
//       onReset();
//       setShowForm(false); // close after success
//     } catch (e) {
//       const msg = e?.response?.data?.message || "Request failed";
//       setErr(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onReset = () => {
//     setForm(emptyForm);
//     setEditId(null);
//   };

//   const openCreate = () => {
//     onReset();
//     setShowForm(true);
//     setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
//   };

//   const onEdit = (row) => {
//     setEditId(row.id);
//     setForm({
//       name: row.name || "",
//       email: row.email || "",
//       phone: row.phone || "",
//       address: row.address || "",
//       status: row.status || "Active",
//     });
//     setShowForm(true);
//     setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
//   };

//   const onDelete = async (id) => {
//     if (!confirm("Delete this customer?")) return;
//     setLoading(true);
//     try {
//       await customersAPI.remove(id);
//       toast.success("Customer deleted");
//       await fetchAll();
//       if (editId === id) onReset();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Failed to delete");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onToggle = async (row) => {
//     setLoading(true);
//     try {
//       await customersAPI.toggleStatus(row.id, row.status);
//       const next = String(row.status).toLowerCase() === "active" ? "Inactive" : "Active";
//       toast.success(`Status set to ${next}`);
//       await fetchAll();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Failed to toggle status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className=" max-w-7xl mx-auto">
//       <div className="flex rounded-md items-center justify-between mb-4 bg-white shadow-md p-3">
//         <h2 className="text-xl font-bold ">Customer Management</h2>
//         <button
//           type="button"
//           onClick={() => (showForm ? setShowForm(false) : openCreate())}
//           className={`px-4 py-2 rounded-lg text-white ${showForm ? "bg-gray-600" : "bg-green-600"} `}
//           title={showForm ? "Close form" : "Add new customer"}
//         >
//           {showForm ? "Close Form" : "+ Add Customer"}
//         </button>
//       </div>

//       {err && <div className="mb-3 text-red-600">{err}</div>}

//       {/* Collapsible Form */}
//       {showForm && (
//         <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl shadow-md p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             {editId ? "Update Customer" : "Register Customer"}
//           </h3>

//           <div className="grid grid-cols-2 gap-4">
//             {/* Name */}
//             <div className="flex flex-col">
//               <label htmlFor="cust_name" className="text-sm text-gray-600 mb-1">Name</label>
//               <input
//                 id="cust_name"
//                 type="text"
//                 placeholder="Full name"
//                 className="border p-2 rounded-lg"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//               />
//             </div>

//             {/* Email */}
//             <div className="flex flex-col">
//               <label htmlFor="cust_email" className="text-sm text-gray-600 mb-1">Email</label>
//               <input
//                 id="cust_email"
//                 type="email"
//                 placeholder="example@domain.com"
//                 className="border p-2 rounded-lg"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//               />
//             </div>

//             {/* Phone */}
//             <div className="flex flex-col">
//               <label htmlFor="cust_phone" className="text-sm text-gray-600 mb-1">Phone</label>
//               <input
//                 id="cust_phone"
//                 type="text"
//                 placeholder="Phone number"
//                 className="border p-2 rounded-lg"
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               />
//             </div>

//             {/* Address */}
//             <div className="flex flex-col">
//               <label htmlFor="cust_address" className="text-sm text-gray-600 mb-1">Address</label>
//               <input
//                 id="cust_address"
//                 type="text"
//                 placeholder="Street, City, State"
//                 className="border p-2 rounded-lg"
//                 value={form.address}
//                 onChange={(e) => setForm({ ...form, address: e.target.value })}
//               />
//             </div>

//             {/* Status */}
//             <div className="flex flex-col">
//               <label htmlFor="cust_status" className="text-sm text-gray-600 mb-1">Status</label>
//               <select
//                 id="cust_status"
//                 className="border p-2 rounded-lg"
//                 value={form.status}
//                 onChange={(e) => setForm({ ...form, status: e.target.value })}
//               >
//                 <option>Active</option>
//                 <option>Inactive</option>
//               </select>
//             </div>
//           </div>

//           <div className="mt-4 flex gap-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
//             >
//               {editId ? "Update" : "Register"}
//             </button>
//             <button
//               type="button"
//               onClick={onReset}
//               className="px-4 py-2 bg-gray-200 rounded-lg"
//             >
//               Reset
//             </button>
//           </div>
//         </form>
//       )}

//       {/* List + Search */}
//       <div className="bg-white shadow-lg rounded-xl p-6">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-lg font-semibold">Customers</h3>
//           <input
//             className="border p-2 rounded-lg w-60"
//             placeholder="Search..."
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//           />
//         </div>

//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2 border">Sl.No.</th>
//                   <th className="p-2 border">Name</th>
//                   <th className="p-2 border">Email</th>
//                   <th className="p-2 border">Phone</th>
//                   <th className="p-2 border">Address</th>
//                   <th className="p-2 border">Status</th>
//                   <th className="p-2 border">Created At</th>
//                   <th className="p-2 border">Updated At</th>
//                   <th className="p-2 border">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((r, idx) => (
//                   <tr key={r.id} className="hover:bg-gray-50">
//                     <td className="p-2 border">{idx + 1}</td>
//                     <td className="p-2 border">{r.name}</td>
//                     <td className="p-2 border">{r.email}</td>
//                     <td className="p-2 border">{r.phone}</td>
//                     <td className="p-2 border">{r.address}</td>
//                     <td className="p-2 border">
//                       <button
//                         onClick={() => onToggle(r)}
//                         className={`px-3 py-1 rounded-full text-white ${
//                           String(r.status).toLowerCase() === "active"
//                             ? "bg-green-500"
//                             : "bg-gray-400"
//                         }`}
//                         title={`Click to ${
//                           String(r.status).toLowerCase() === "active"
//                             ? "deactivate"
//                             : "activate"
//                         }`}
//                       >
//                         {r.status}
//                       </button>
//                     </td>
//                     <td className="p-2 border">
//                       {r.created_at_formatted || r.created_at}
//                     </td>
//                     <td className="p-2 border">
//                       {r.updated_at_formatted || r.updated_at}
//                     </td>
//                     <td className="p-2 border">
//                       <div className="flex gap-2">
//                         <button
//                           className="px-3 py-1 bg-blue-600 text-white rounded"
//                           onClick={() => onEdit(r)}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           className="px-3 py-1 bg-red-600 text-white rounded"
//                           onClick={() => onDelete(r.id)}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {!filtered.length && (
//                   <tr>
//                     <td className="p-4 text-center" colSpan={9}>
//                       No customers found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// src/pages/customers/CustomersPage.jsx
import { useEffect, useMemo, useState } from "react";
import customersAPI from "../../axios/customerAPI";
import { toast } from "react-toastify";

// Inline Toggle component (no separate import needed)
function Toggle({ checked = false, onChange, disabled = false, size = "md" }) {
  const sizes = {
    sm: { track: "h-5 w-10", thumb: "h-4 w-4", on: "translate-x-5", off: "translate-x-1" },
    md: { track: "h-6 w-12", thumb: "h-5 w-5", on: "translate-x-6", off: "translate-x-1" },
    lg: { track: "h-7 w-14", thumb: "h-6 w-6", on: "translate-x-7", off: "translate-x-1" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        "relative inline-flex items-center rounded-full transition-colors cursor-pointer focus:outline-none shadow-inner",
        checked ? "bg-emerald-500" : "bg-gray-300",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        s.track,
      ].join(" ")}
      aria-pressed={checked}
      aria-label="Toggle status"
    >
      <span
        className={[
          "inline-block transform rounded-full bg-white shadow transition-transform cursor-pointer",
          s.thumb,
          checked ? s.on : s.off,
        ].join(" ")}
      />
    </button>
  );
}

const emptyForm = { name: "", email: "", phone: "", address: "", status: "Active" };

export default function CustomersPage() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.address, r.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await customersAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Failed to load customers");
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
    if (form.phone && !/^\d{7,15}$/.test(form.phone)) return "Invalid phone";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      toast.error(v);
      return;
    }
    setErr("");
    setLoading(true);
    try {
      if (editId) {
        await customersAPI.update(editId, form);
        toast.success("Customer updated");
      } else {
        const res = await customersAPI.create(form);
        toast.success(res?.status === 201 ? "Customer created" : "Customer created");
      }
      await fetchAll();
      onReset();
      setShowForm(false);
    } catch (e2) {
      const msg = e2?.response?.data?.message || "Request failed";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const openCreate = () => {
    onReset();
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const onEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
      status: row.status || "Active",
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    setLoading(true);
    try {
      await customersAPI.remove(id);
      toast.success("Customer deleted");
      await fetchAll();
      if (editId === id) onReset();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  // Optimistic toggle for snappy UX
  const onToggleOptimistic = async (row) => {
    const wasActive = String(row.status).toLowerCase() === "active";
    setRows((list) =>
      list.map((x) => (x.id === row.id ? { ...x, status: wasActive ? "Inactive" : "Active" } : x))
    );
    try {
      await customersAPI.toggleStatus(row.id, row.status);
      toast.success(`Status set to ${wasActive ? "Inactive" : "Active"}`);
    } catch (e) {
      // revert on error
      setRows((list) => list.map((x) => (x.id === row.id ? { ...x, status: row.status } : x)));
      toast.error(e?.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div className=" max-w-7xl mx-auto">
      <div className="flex rounded-md items-center justify-between mb-4 bg-white shadow-md p-3">
        <h2 className="text-xl font-bold">Customer Management</h2>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className={`px-4 py-2 rounded-lg text-white ${showForm ? "bg-gray-600" : "bg-green-600"}`}
          title={showForm ? "Close form" : "Add new customer"}
        >
          {showForm ? "Close Form" : "+ Add Customer"}
        </button>
      </div>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      {/* Collapsible Form */}
      {showForm && (
        <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editId ? "Update Customer" : "Register Customer"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col">
              <label htmlFor="cust_name" className="text-sm text-gray-600 mb-1">Name</label>
              <input
                id="cust_name"
                type="text"
                placeholder="Full name"
                className="border p-2 rounded-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="cust_email" className="text-sm text-gray-600 mb-1">Email</label>
              <input
                id="cust_email"
                type="email"
                placeholder="example@domain.com"
                className="border p-2 rounded-lg"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label htmlFor="cust_phone" className="text-sm text-gray-600 mb-1">Phone</label>
              <input
                id="cust_phone"
                type="text"
                placeholder="Phone number"
                className="border p-2 rounded-lg"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="flex flex-col">
              <label htmlFor="cust_address" className="text-sm text-gray-600 mb-1">Address</label>
              <input
                id="cust_address"
                type="text"
                placeholder="Street, City, State"
                className="border p-2 rounded-lg"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label htmlFor="cust_status" className="text-sm text-gray-600 mb-1">Status</label>
              <select
                id="cust_status"
                className="border p-2 rounded-lg"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
            >
              {editId ? "Update" : "Register"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* List + Search */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Customers</h3>
          <input
            className="border p-2 rounded-lg w-60"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Sl.No.</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Updated At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{idx + 1}</td>
                    <td className="p-2 border">{r.name}</td>
                    <td className="p-2 border">{r.email}</td>
                    <td className="p-2 border">{r.phone}</td>
                    <td className="p-2 border">{r.address}</td>
                    <td className="p-2 border">
                      <Toggle
                        checked={String(r.status).toLowerCase() === "active"}
                        onChange={() => onToggleOptimistic(r)}
                        size="md"
                      />
                    </td>
                    <td className="p-2 border">{r.created_at_formatted || r.created_at}</td>
                    <td className="p-2 border">{r.updated_at_formatted || r.updated_at}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onEdit(r)}>
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td className="p-4 text-center" colSpan={9}>No customers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
