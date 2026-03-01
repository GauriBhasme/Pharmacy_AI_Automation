import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export default function AgentTracking() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/admin/agent-logs?limit=100", {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to fetch logs");
      }

      const data = await res.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      setError(err.message || "Failed to load agent trace logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1b2d] text-slate-200 px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Traceability</h1>
          <p className="text-slate-400 mt-1">Langfuse + DB activity traces for agent actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#254b78] px-4 py-2 rounded-lg transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading agent traces...
        </div>
      ) : error ? (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-4">{error}</div>
      ) : logs.length === 0 ? (
        <div className="bg-[#16263f] border border-[#1f3557] rounded-xl p-6 text-slate-300">
          No agent activity traces found yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#16263f] border border-[#1f3557] rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-[#1a3152] text-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Trace ID</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Activity</th>
                <th className="text-left px-4 py-3">Intent</th>
                <th className="text-left px-4 py-3">Medicine</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[#1f3557]">
                  <td className="px-4 py-3 text-slate-300">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-300">{log.trace_id}</td>
                  <td className="px-4 py-3">{log.user_id ?? "-"}</td>
                  <td className="px-4 py-3">{log.activity_type}</td>
                  <td className="px-4 py-3">{log.intent || "-"}</td>
                  <td className="px-4 py-3">{log.medicine_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        log.status === "success"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-red-900/50 text-red-300"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.duration_ms ?? "-"} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
