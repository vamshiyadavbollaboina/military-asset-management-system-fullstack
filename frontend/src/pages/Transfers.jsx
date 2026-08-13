import { useEffect, useState } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";

import api from "../services/api";

import { getTransfers, createTransfer } from "../services/transferApi";

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [bases, setBases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingBases, setLoadingBases] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    sourceBaseId: "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: "",
  });

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTransfers();

      console.log("Transfers API response:", response);

      const data = response?.data || response;

      const transferData = data?.transfers || data?.transfer || data || [];

      setTransfers(Array.isArray(transferData) ? transferData : []);
    } catch (err) {
      console.error("Load transfers error:", err);

      setError(err?.response?.data?.message || "Failed to load transfers");

      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      setLoadingEquipment(true);

      const response = await api.get("/equipment-types");

      console.log("Equipment Types API response:", response);

      const data = response?.data || response;

      const types = data?.equipmentTypes || data?.equipment_types || data || [];

      setEquipmentTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error("Load equipment types error:", err);

      setError(
        err?.response?.data?.message || "Failed to load equipment types",
      );

      setEquipmentTypes([]);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const loadBases = async () => {
    try {
      setLoadingBases(true);

      const response = await api.get("/bases");

      console.log("Bases API response:", response);

      const data = response?.data || response;

      const baseData = data?.bases || data?.base || data || [];

      setBases(Array.isArray(baseData) ? baseData : []);
    } catch (err) {
      console.error("Load bases error:", err);

      setError(err?.response?.data?.message || "Failed to load bases");

      setBases([]);
    } finally {
      setLoadingBases(false);
    }
  };

  useEffect(() => {
    loadTransfers();
    loadEquipmentTypes();
    loadBases();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.sourceBaseId) {
      setError("Please select the source base.");
      return;
    }

    if (!form.destinationBaseId) {
      setError("Please select the destination base.");
      return;
    }

    if (Number(form.sourceBaseId) === Number(form.destinationBaseId)) {
      setError("Source and destination bases must be different.");
      return;
    }

    if (!form.equipmentTypeId) {
      setError("Please select an equipment type.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        sourceBaseId: Number(form.sourceBaseId),

        destinationBaseId: Number(form.destinationBaseId),

        equipmentTypeId: Number(form.equipmentTypeId),

        quantity: Number(form.quantity),
      };

      console.log("Creating transfer:", payload);

      await createTransfer(payload);

      setSuccess("Transfer created successfully.");

      setForm({
        sourceBaseId: "",
        destinationBaseId: "",
        equipmentTypeId: "",
        quantity: "",
      });

      await loadTransfers();
    } catch (err) {
      console.error("Create transfer error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Transfer failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    await Promise.all([loadTransfers(), loadEquipmentTypes(), loadBases()]);
  };

  const getBaseName = (id) => {
    const base = bases.find((item) => Number(item.id) === Number(id));

    if (!base) {
      return `Base #${id}`;
    }

    return base.name || `Base #${base.id}`;
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id),
    );

    if (!equipment) {
      return `Equipment #${id}`;
    }

    return (
      equipment.name || equipment.equipmentName || `Equipment #${equipment.id}`
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Transfers
          </h1>

          <p className="text-slate-500 mt-1">
            Manage cross-base asset movements
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || loadingEquipment || loadingBases}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw
            size={17}
            className={
              loading || loadingEquipment || loadingBases ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-sm font-semibold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ArrowLeftRight size={20} className="text-slate-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Initiate Transfer
            </h2>

            <p className="text-sm text-slate-500">
              Move assets between military bases
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Source Base
            </label>

            <select
              name="sourceBaseId"
              value={form.sourceBaseId}
              onChange={handleChange}
              required
              disabled={loadingBases}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
            >
              <option value="">
                {loadingBases ? "Loading bases..." : "Select source base"}
              </option>

              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                  {base.location ? ` — ${base.location}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination Base
            </label>

            <select
              name="destinationBaseId"
              value={form.destinationBaseId}
              onChange={handleChange}
              required
              disabled={loadingBases}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
            >
              <option value="">
                {loadingBases ? "Loading bases..." : "Select destination base"}
              </option>

              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                  {base.location ? ` — ${base.location}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Equipment Type
            </label>

            <select
              name="equipmentTypeId"
              value={form.equipmentTypeId}
              onChange={handleChange}
              required
              disabled={loadingEquipment}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
            >
              <option value="">
                {loadingEquipment
                  ? "Loading equipment..."
                  : "Select equipment type"}
              </option>

              {equipmentTypes.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name ||
                    equipment.equipmentName ||
                    `Equipment #${equipment.id}`}

                  {equipment.category ? ` — ${equipment.category}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity
            </label>

            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="Enter quantity"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={submitting || loadingEquipment || loadingBases}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeftRight size={18} />

              {submitting ? "Processing..." : "Transfer Assets"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Transfer History</h2>

              <p className="text-sm text-slate-500 mt-1">
                Record of cross-base asset movements
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {transfers.length} Records
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw
              size={24}
              className="animate-spin mx-auto text-slate-400"
            />

            <p className="text-slate-500 mt-3">Loading transfers...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-10 text-center">
            <ArrowLeftRight size={40} className="mx-auto text-slate-300" />

            <p className="text-slate-600 font-medium mt-3">
              No transfers found
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Create a transfer using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    ID
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Source
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Destination
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Equipment
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      #{transfer.id}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {transfer.sourceBase?.name ||
                        getBaseName(transfer.sourceBaseId)}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {transfer.destinationBase?.name ||
                        getBaseName(transfer.destinationBaseId)}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {transfer.equipmentType?.name ||
                        getEquipmentName(transfer.equipmentTypeId)}
                    </td>

                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-900">
                        {Number(transfer.quantity || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        {transfer.status || "COMPLETED"}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(
                        transfer.createdAt ||
                          transfer.transferDate ||
                          transfer.date,
                      )}
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

export default Transfers;
