import { useEffect, useState } from "react";
import { PackageX, RefreshCw } from "lucide-react";

import api from "../services/api";

import { getExpenditures, createExpenditure } from "../services/expenditureApi";

const Expenditures = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [bases, setBases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingBases, setLoadingBases] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    baseId: "",
    equipmentTypeId: "",
    quantity: "",
    reason: "",
  });

  const loadExpenditures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExpenditures();

      console.log("Expenditures API response:", response);

      const data = response?.data || response;

      const expenditureData =
        data?.expenditures || data?.expenditure || data || [];

      setExpenditures(Array.isArray(expenditureData) ? expenditureData : []);
    } catch (err) {
      console.error("Load expenditures error:", err);

      setError(err?.response?.data?.message || "Failed to load expenditures");

      setExpenditures([]);
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
    loadExpenditures();
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

    if (!form.baseId) {
      setError("Please select a base.");
      return;
    }

    if (!form.equipmentTypeId) {
      setError("Please select an equipment type.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please enter the expenditure reason.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        baseId: Number(form.baseId),

        equipmentTypeId: Number(form.equipmentTypeId),

        quantity: Number(form.quantity),

        reason: form.reason.trim(),
      };

      console.log("Creating expenditure:", payload);

      await createExpenditure(payload);

      setSuccess("Expenditure recorded successfully.");

      setForm({
        baseId: "",
        equipmentTypeId: "",
        quantity: "",
        reason: "",
      });

      await loadExpenditures();
    } catch (err) {
      console.error("Create expenditure error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create expenditure",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    await Promise.all([loadExpenditures(), loadEquipmentTypes(), loadBases()]);
  };

  const getEquipmentName = (id) => {
    const equipment = equipmentTypes.find(
      (item) => Number(item.id) === Number(id),
    );

    return equipment?.name || equipment?.equipmentName || `Equipment #${id}`;
  };

  const getBaseName = (id) => {
    const base = bases.find((item) => Number(item.id) === Number(id));

    return base?.name || `Base #${id}`;
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
            Expenditures
          </h1>

          <p className="text-slate-500 mt-1">
            Record consumed or expended military assets
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
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <PackageX size={20} className="text-slate-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Record Expenditure
            </h2>

            <p className="text-sm text-slate-500">
              Record consumed or expended assets
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Base
            </label>

            <select
              name="baseId"
              value={form.baseId}
              onChange={handleChange}
              required
              disabled={loadingBases}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingBases ? "Loading bases..." : "Select base"}
              </option>

              {!loadingBases &&
                bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}

                    {base.location ? ` - ${base.location}` : ""}
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

              {!loadingEquipment &&
                equipmentTypes.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name ||
                      equipment.equipmentName ||
                      `Equipment #${equipment.id}`}

                    {equipment.category ? ` - ${equipment.category}` : ""}
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
              placeholder="100"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason
            </label>

            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              required
              placeholder="Training / Operation / Damage"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={submitting || loadingEquipment || loadingBases}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <PackageX size={18} />

              {submitting ? "Saving..." : "Record Expenditure"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Expenditure History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Recorded asset expenditures
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {expenditures.length} Records
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw
              size={24}
              className="animate-spin mx-auto text-slate-400"
            />

            <p className="text-slate-500 mt-3">Loading expenditures...</p>
          </div>
        ) : expenditures.length === 0 ? (
          <div className="p-10 text-center">
            <PackageX size={40} className="mx-auto text-slate-300" />

            <p className="text-slate-600 font-medium mt-3">
              No expenditures found
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Record an expenditure using the form above.
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
                    Base
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Equipment
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Reason
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenditures.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      #{item.id}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {item.base?.name || getBaseName(item.baseId)}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {item.equipmentType?.name ||
                        getEquipmentName(item.equipmentTypeId)}
                    </td>

                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-900">
                        {Number(item.quantity || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {item.reason || "-"}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(item.createdAt || item.expendedDate)}
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

export default Expenditures;
