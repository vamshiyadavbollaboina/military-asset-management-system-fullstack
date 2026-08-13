import { useEffect, useState } from "react";
import {
  Package,
  ArrowUpDown,
  ClipboardCheck,
  PackageX,
  Boxes,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getDashboardMetrics } from "../services/dashboardApi";
import NetMovementModal from "../components/NetMovementModal";

const Dashboard = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    closingBalance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMovement, setShowMovement] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardMetrics();

      const data = response?.data || response;

      const metricsData = data?.metrics || {};

      setMetrics({
        openingBalance: Number(metricsData?.openingBalance) || 0,

        purchases: Number(metricsData?.purchases) || 0,

        transfersIn: Number(metricsData?.transfersIn) || 0,

        transfersOut: Number(metricsData?.transfersOut) || 0,

        netMovement: Number(metricsData?.netMovement) || 0,

        assigned: Number(metricsData?.assigned) || 0,

        expended: Number(metricsData?.expended) || 0,

        closingBalance: Number(metricsData?.closingBalance) || 0,
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.response?.data?.message || "Failed to load dashboard metrics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const stats = [
    {
      title: "Opening Balance",
      value: metrics.openingBalance,
      icon: Package,
      description: "Starting inventory",
    },
    {
      title: "Net Movement",
      value: metrics.netMovement,
      icon: ArrowUpDown,
      description: "Purchases + Transfers In - Transfers Out",
      clickable: true,
    },
    {
      title: "Assigned",
      value: metrics.assigned,
      icon: ClipboardCheck,
      description: "Assets assigned",
    },
    {
      title: "Expended",
      value: metrics.expended,
      icon: PackageX,
      description: "Assets consumed",
    },
    {
      title: "Closing Balance",
      value: metrics.closingBalance,
      icon: Boxes,
      description: "Current inventory",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Military asset inventory overview
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Logged in user
            </p>

            <p className="text-lg font-semibold text-slate-900 mt-1">
              {user?.username || "Unknown User"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {user?.role || "UNKNOWN"}
            </span>

            {user?.baseId && (
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                Base #{user.baseId}
              </span>
            )}

            {user?.baseName && (
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                {user.baseName}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">{error}</p>

            <button
              onClick={loadMetrics}
              className="text-sm font-semibold underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-28" />

              <div className="h-8 bg-slate-200 rounded w-20 mt-4" />

              <div className="h-3 bg-slate-200 rounded w-32 mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                onClick={() => {
                  if (stat.clickable) {
                    setShowMovement(true);
                  }
                }}
                className={`
                  bg-white
                  rounded-xl
                  border
                  border-slate-200
                  p-5
                  shadow-sm
                  transition
                  ${
                    stat.clickable
                      ? "cursor-pointer hover:border-slate-400 hover:shadow-md"
                      : ""
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {Number(stat.value).toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {stat.description}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={21} className="text-slate-700" />
                  </div>
                </div>

                {stat.clickable && (
                  <p className="text-xs text-blue-600 font-medium mt-4">
                    Click to view breakdown
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PURCHASES */}

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Purchases</p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                +{metrics.purchases.toLocaleString()}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <Package size={21} className="text-green-600" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Assets added through purchases
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">Transfers</p>

            <ArrowUpDown size={21} className="text-slate-600" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Transfers In</span>

              <span className="font-semibold text-green-600">
                +{metrics.transfersIn.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Transfers Out</span>

              <span className="font-semibold text-red-600">
                -{metrics.transfersOut.toLocaleString()}
              </span>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Net Transfer
              </span>

              <span className="font-bold text-slate-900">
                {(metrics.transfersIn - metrics.transfersOut).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Closing Balance</p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {metrics.closingBalance.toLocaleString()}
              </p>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <Boxes size={21} className="text-blue-600" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Available inventory after assignments and expenditures
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            Inventory Calculation
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current inventory calculation summary
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm">
            <div className="flex-1 bg-slate-50 rounded-lg p-4">
              <p className="text-slate-500">Opening Balance</p>

              <p className="text-xl font-bold mt-1">
                {metrics.openingBalance.toLocaleString()}
              </p>
            </div>

            <span className="text-slate-400 font-bold hidden md:block">+</span>

            <div className="flex-1 bg-green-50 rounded-lg p-4">
              <p className="text-green-700">Net Movement</p>

              <p className="text-xl font-bold text-green-700 mt-1">
                {metrics.netMovement.toLocaleString()}
              </p>
            </div>

            <span className="text-slate-400 font-bold hidden md:block">-</span>

            <div className="flex-1 bg-orange-50 rounded-lg p-4">
              <p className="text-orange-700">Assigned</p>

              <p className="text-xl font-bold text-orange-700 mt-1">
                {metrics.assigned.toLocaleString()}
              </p>
            </div>

            <span className="text-slate-400 font-bold hidden md:block">-</span>

            <div className="flex-1 bg-red-50 rounded-lg p-4">
              <p className="text-red-700">Expended</p>

              <p className="text-xl font-bold text-red-700 mt-1">
                {metrics.expended.toLocaleString()}
              </p>
            </div>

            <span className="text-slate-400 font-bold hidden md:block">=</span>

            <div className="flex-1 bg-blue-50 rounded-lg p-4">
              <p className="text-blue-700">Closing Balance</p>

              <p className="text-xl font-bold text-blue-700 mt-1">
                {metrics.closingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-5 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Calculation
            </p>

            <p className="text-sm font-medium text-slate-700 mt-1">
              {metrics.openingBalance.toLocaleString()}
              {" + "}
              {metrics.netMovement.toLocaleString()}
              {" - "}
              {metrics.assigned.toLocaleString()}
              {" - "}
              {metrics.expended.toLocaleString()}
              {" = "}
              <span className="font-bold text-blue-700">
                {metrics.closingBalance.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {showMovement && (
        <NetMovementModal
          metrics={metrics}
          onClose={() => setShowMovement(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
