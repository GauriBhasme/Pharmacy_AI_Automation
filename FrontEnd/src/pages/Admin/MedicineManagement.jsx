export default function MedicineManagement() {
  //call to endpoint http://localhost:5000/api/admin/medicines to get medicine data
  const medicines = [
    {
      name: "Amoxicillin 500mg",
      stock: 1450,
      status: "In Stock",
    },
    {
      name: "Lisinopril 10mg",
      stock: 120,
      status: "Low Stock",
    },
    {
      name: "Insulin Glargine",
      stock: 0,
      status: "Out of Stock",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-500/20 text-emerald-400";
      case "Low Stock":
        return "bg-yellow-500/20 text-yellow-400";
      case "Out of Stock":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <h1 className="text-3xl font-bold text-white mb-6">
        Medicine Management
      </h1>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-wider border-b border-slate-700">
                <th className="pb-4">Medicine Name</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {medicines.map((med, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-800 transition duration-200"
                >
                  <td className="py-5 text-white font-medium">
                    {med.name}
                  </td>

                  <td className="py-5 text-slate-300">
                    {med.stock}
                  </td>

                  <td className="py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        med.status
                      )}`}
                    >
                      {med.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}