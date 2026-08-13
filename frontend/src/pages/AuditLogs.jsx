import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";

import api from "../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/audit-logs");

      console.log("Audit Logs API response:", response);

      const data = response?.data;

      const auditLogs = data?.auditLogs || data?.audit_logs || data || [];

      setLogs(Array.isArray(auditLogs) ? auditLogs : []);
    } catch (err) {
      console.error("Load audit logs error:", err);

      setError(err?.response?.data?.message || "Failed to load audit logs");

      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRefresh = async () => {
    await loadLogs(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Audit Logs
          </h1>

          <p className="text-slate-500 mt-1">
            View system activity and asset mutation history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            rounded-lg
            bg-slate-900
            text-white
            text-sm
            font-medium
            hover:bg-slate-800
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition
          "
        >
          <RefreshCw
            size={17}
            className={loading || refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm font-semibold underline hover:no-underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw
              size={26}
              className="animate-spin mx-auto text-slate-400"
            />

            <p className="text-slate-500 mt-3">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={40} className="mx-auto text-slate-400 mb-3" />

            <p className="text-slate-600 font-medium">No audit logs found.</p>

            <p className="text-sm text-slate-400 mt-1">
              System activity will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    ID
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    User
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Action
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Details
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      #{log.id}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {log.username || log.user?.username || log.user_id || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {log.action || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <p
                        className="truncate text-slate-600"
                        title={log.details || ""}
                      >
                        {log.details || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
