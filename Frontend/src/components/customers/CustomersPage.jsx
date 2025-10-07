// src/pages/customers/CustomersPage.jsx
import { useEffect, useMemo, useState } from "react";
import customersAPI from "../../axios/customerAPI";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
};

export default function CustomersPage() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

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
        const status = res?.status;
        if (status === 201) {
          toast.success("Customer created");
        } else {
          toast.success("Customer created");
        }
      }
      await fetchAll();
      onReset();
    } catch (e) {
      const msg = e?.response?.data?.message || "Request failed";
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

  const onEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
      status: row.status || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const onToggle = async (row) => {
    setLoading(true);
    try {
      await customersAPI.toggleStatus(row.id, row.status);
      const next = String(row.status).toLowerCase() === "active" ? "Inactive" : "Active";
      toast.success(`Status set to ${next}`);
      await fetchAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Customer Management</h2>

      {err && <div className="mb-3 text-red-600">{err}</div>}

      {/* Register / Edit Form */}
      <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {editId ? "Update Customer" : "Register Customer"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded-lg"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="border p-2 rounded-lg"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded-lg"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <select
            className="border p-2 rounded-lg"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
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
                      <button
                        onClick={() => onToggle(r)}
                        className={`px-3 py-1 rounded-full text-white ${
                          String(r.status).toLowerCase() === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                        title={`Click to ${
                          String(r.status).toLowerCase() === "active"
                            ? "deactivate"
                            : "activate"
                        }`}
                      >
                        {r.status}
                      </button>
                    </td>
                    <td className="p-2 border">
                      {r.created_at_formatted || r.created_at}
                    </td>
                    <td className="p-2 border">
                      {r.updated_at_formatted || r.updated_at}
                    </td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                          onClick={() => onEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() => onDelete(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td className="p-4 text-center" colSpan={9}>
                      No customers found
                    </td>
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
