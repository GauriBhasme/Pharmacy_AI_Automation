import { useEffect, useState } from "react";
import { Plus, Package, Search, Pencil } from "lucide-react";

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    composition: "",
    dosage: "",
    side_effects: "",
    contraindications: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        q: searchTerm,
        stockStatus: stockStatusFilter,
      }).toString();

      const res = await fetch(`http://localhost:5000/api/admin/medicines?${query}`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, stockStatusFilter]);

  const resetForm = () => {
    setNewMedicine({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      composition: "",
      dosage: "",
      side_effects: "",
      contraindications: "",
    });
  };

  const handleAddMedicine = async () => {
    try {
      const payload = {
        name: newMedicine.name,
        price: parseFloat(newMedicine.price || "0"),
        stock: parseInt(newMedicine.stock || "0", 10),
        category: newMedicine.category,
        description: newMedicine.description,
        composition: newMedicine.composition,
        dosage: newMedicine.dosage,
        side_effects: newMedicine.side_effects,
        contraindications: newMedicine.contraindications,
      };

      const res = await fetch("http://localhost:5000/api/admin/medicines", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData?.message || "Failed to add medicine");
        return;
      }

      resetForm();
      setShowCreateModal(false);
      fetchMedicines();
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add medicine");
    }
  };

  const handleUpdateMedicine = async () => {
    if (!editingMedicine) return;

    try {
      const payload = {
        name: editingMedicine.name,
        price: parseFloat(editingMedicine.price || "0"),
        stock: parseInt(editingMedicine.stock || "0", 10),
        category: editingMedicine.category || "",
        description: editingMedicine.description || "",
        composition: editingMedicine.composition || "",
        dosage: editingMedicine.dosage || "",
        side_effects: editingMedicine.side_effects || "",
        contraindications: editingMedicine.contraindications || "",
      };

      const res = await fetch(`http://localhost:5000/api/admin/medicines/${editingMedicine.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData?.message || "Failed to update medicine");
        return;
      }

      setShowEditModal(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update medicine");
    }
  };

  const getStockBadge = (med) => {
    if (Number(med.stock) === 0) {
      return <span className="px-2 py-1 rounded-full text-xs bg-red-900/60 text-red-300">OUT OF STOCK</span>;
    }
    if (Number(med.stock) <= 10) {
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-900/60 text-yellow-300">LOW STOCK</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-emerald-900/60 text-emerald-300">IN STOCK</span>;
  };

  return (
    <div className="min-h-screen bg-[#0f1b2d] text-slate-200 px-10 py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Inventory</h1>
          <p className="text-slate-400 mt-1">Search, track stock status, and update medicines</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#254b78] px-5 py-3 rounded-xl transition"
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, composition..."
            className="w-full pl-9 pr-3 py-3 rounded-lg bg-[#16263f] border border-[#1f3557] text-white"
          />
        </div>
        <select
          value={stockStatusFilter}
          onChange={(e) => setStockStatusFilter(e.target.value)}
          className="w-full py-3 px-3 rounded-lg bg-[#16263f] border border-[#1f3557] text-white"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock (&lt;=10)</option>
          <option value="out">Out of Stock (=0)</option>
          <option value="in">In Stock (&gt;10)</option>
        </select>
      </div>

      {loading && <p className="text-slate-400 mb-6">Loading medicines...</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {medicines.map((med) => (
          <div key={med.id} className="bg-[#16263f] border border-[#1f3557] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#1f3557] rounded-xl">
                  <Package className="text-blue-400" size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">{med.name}</h2>
                  <p className="text-sm text-slate-400">ID: {med.id}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingMedicine({ ...med });
                  setShowEditModal(true);
                }}
                className="p-2 rounded-lg bg-[#1f3557] hover:bg-[#2b4a73]"
                title="Edit medicine"
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="mb-3">{getStockBadge(med)}</div>

            <div className="space-y-2 text-sm text-slate-300">
              <p>Price: Rs {med.price}</p>
              <p>Stock: {med.stock}</p>
              {med.category && <p>Category: {med.category}</p>}
              {med.description && <p>Description: {med.description}</p>}
              {med.composition && <p>Composition: {med.composition}</p>}
              {med.dosage && <p>Dosage: {med.dosage}</p>}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <MedicineFormModal
          title="Add New Medicine"
          data={newMedicine}
          setData={setNewMedicine}
          onCancel={() => setShowCreateModal(false)}
          onSave={handleAddMedicine}
          saveLabel="Save"
        />
      )}

      {showEditModal && editingMedicine && (
        <MedicineFormModal
          title="Update Medicine"
          data={editingMedicine}
          setData={setEditingMedicine}
          onCancel={() => {
            setShowEditModal(false);
            setEditingMedicine(null);
          }}
          onSave={handleUpdateMedicine}
          saveLabel="Update"
        />
      )}
    </div>
  );
}

function MedicineFormModal({ title, data, setData, onCancel, onSave, saveLabel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#16263f] border border-[#1f3557] rounded-2xl p-8 w-[560px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-white">{title}</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Medicine Name"
            value={data.name || ""}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price"
              value={data.price || ""}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className="w-full p-3 rounded-lg bg-[#1f3557]"
            />
            <input
              type="number"
              placeholder="Stock"
              value={data.stock || ""}
              onChange={(e) => setData({ ...data, stock: e.target.value })}
              className="w-full p-3 rounded-lg bg-[#1f3557]"
            />
          </div>

          <input
            type="text"
            placeholder="Category"
            value={data.category || ""}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <textarea
            placeholder="Description"
            value={data.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <input
            type="text"
            placeholder="Composition"
            value={data.composition || ""}
            onChange={(e) => setData({ ...data, composition: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <input
            type="text"
            placeholder="Dosage"
            value={data.dosage || ""}
            onChange={(e) => setData({ ...data, dosage: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <textarea
            placeholder="Side Effects"
            value={data.side_effects || ""}
            onChange={(e) => setData({ ...data, side_effects: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />

          <textarea
            placeholder="Contraindications"
            value={data.contraindications || ""}
            onChange={(e) => setData({ ...data, contraindications: e.target.value })}
            className="w-full p-3 rounded-lg bg-[#1f3557]"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-[#1f3557]">
            Cancel
          </button>

          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
