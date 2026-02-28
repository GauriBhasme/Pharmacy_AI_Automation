import { useEffect, useState } from "react";
import { Plus, Package } from "lucide-react";

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    med_name: "",
    pzn: "",
    price: "",
    package_size: "",
    description: "",
    requires_prescription: false,
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
      const res = await fetch(
        "http://localhost:5000/api/admin/medicines",
        { headers: getAuthHeaders() }
      );

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
  }, []);

  const handleAddMedicine = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/medicines",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            med_name: newMedicine.med_name,
            pzn: newMedicine.pzn,
            price: parseFloat(newMedicine.price),
            package_size: newMedicine.package_size,
            description: newMedicine.description,
            requires_prescription: newMedicine.requires_prescription,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed:", errorData);
        alert("Failed to add medicine");
        return;
      }

      const createdMedicine = await res.json();

      // Instantly update UI
      setMedicines((prev) => [...prev, createdMedicine]);

      // Reset form
      setNewMedicine({
        med_name: "",
        pzn: "",
        price: "",
        package_size: "",
        description: "",
        requires_prescription: false,
      });

      setShowModal(false);

    } catch (err) {
      console.error("Add error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1b2d] text-slate-200 px-10 py-10">

      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white">Inventory</h1>
          <p className="text-slate-400 mt-1">
            Manage medicines
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#254b78] px-5 py-3 rounded-xl transition"
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {loading && (
        <p className="text-slate-400 mb-6">Loading medicines...</p>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {medicines.map((med) => (
          <div
            key={med.med_id}
            className="bg-[#16263f] border border-[#1f3557] rounded-2xl p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#1f3557] rounded-xl">
                <Package className="text-blue-400" size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {med.med_name}
                </h2>
                <p className="text-sm text-slate-400">
                  PZN: {med.pzn}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <p>Price: ₹{med.price}</p>
              {med.package_size && <p>Package Size: {med.package_size}</p>}
              {med.description && <p>Description: {med.description}</p>}
              <p>
                Prescription:{" "}
                {med.requires_prescription ? "Required" : "Not Required"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#16263f] border border-[#1f3557] rounded-2xl p-8 w-[480px]">
            <h2 className="text-xl font-semibold mb-6 text-white">
              Add New Medicine
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Medicine Name"
                value={newMedicine.med_name}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, med_name: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-[#1f3557]"
              />

              <input
                type="text"
                placeholder="PZN"
                value={newMedicine.pzn}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, pzn: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-[#1f3557]"
              />

              <input
                type="number"
                placeholder="Price"
                value={newMedicine.price}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, price: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-[#1f3557]"
              />

              <input
                type="text"
                placeholder="Package Size"
                value={newMedicine.package_size}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, package_size: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-[#1f3557]"
              />

              <textarea
                placeholder="Description"
                value={newMedicine.description}
                onChange={(e) =>
                  setNewMedicine({ ...newMedicine, description: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-[#1f3557]"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newMedicine.requires_prescription}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      requires_prescription: e.target.checked,
                    })
                  }
                />
                Requires Prescription
              </label>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1f3557]"
              >
                Cancel
              </button>

              <button
                onClick={handleAddMedicine}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}