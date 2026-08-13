import { useEffect, useState } from "react";
import { Plus, RefreshCw, Package } from "lucide-react";

import { getPurchases, createPurchase } from "../services/purchaseApi";

import api from "../services/api";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    equipmentTypeId: "",
    quantity: "",
    date: "",
  });

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPurchases();

      console.log("Purchases API response:", response);

      const data = response?.data || response;

      const purchaseData = data?.purchases || [];

      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
    } catch (err) {
      console.error("Load purchases error:", err);

      setError(err?.response?.data?.message || "Failed to load purchases");

      setPurchases([]);
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

  useEffect(() => {
    loadPurchases();
    loadEquipmentTypes();
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

    if (!form.equipmentTypeId) {
      setError("Please select an equipment type.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!form.date) {
      setError("Please select a purchase date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        baseId: 1,

        equipmentTypeId: Number(form.equipmentTypeId),

        quantity: Number(form.quantity),

        purchaseDate: form.date,
      };

      console.log("Creating purchase:", payload);

      await createPurchase(payload);

      setSuccess("Purchase created successfully.");

      setForm({
        equipmentTypeId: "",
        quantity: "",
        date: "",
      });

      await loadPurchases();
    } catch (err) {
      console.error("Create purchase error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create purchase",
      );
    } finally {
      setSubmitting(false);
    }
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
            Purchases
          </h1>

          <p className="text-slate-500 mt-1">Record incoming military assets</p>
        </div>

        <button
          onClick={loadPurchases}
          disabled={loading}
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
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
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
            <Plus size={20} className="text-slate-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Purchase
            </h2>

            <p className="text-sm text-slate-500">
              Add incoming assets to Fort Alpha
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Base
            </label>

            <input
              type="text"
              value="Fort Alpha"
              disabled
              className="
                w-full
                border
                border-slate-300
                bg-slate-100
                text-slate-600
                rounded-lg
                px-3
                py-2.5
              "
            />

            <p className="text-xs text-slate-400 mt-1">Base ID: 1</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Equipment Type
            </label>

            <select
              name="equipmentTypeId"
              value={form.equipmentTypeId}
              onChange={handleChange}
              disabled={loadingEquipment}
              required
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2.5
                bg-white
                outline-none
                focus:ring-2
                focus:ring-slate-300
                disabled:bg-slate-100
              "
            >
              <option value="">
                {loadingEquipment ? "Loading equipment..." : "Select equipment"}
              </option>

              {equipmentTypes.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name}
                  {" - "}
                  {equipment.category}
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
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2.5
                outline-none
                focus:ring-2
                focus:ring-slate-300
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Purchase Date
            </label>

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                px-3
                py-2.5
                outline-none
                focus:ring-2
                focus:ring-slate-300
              "
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-slate-900
                text-white
                px-6
                py-2.5
                rounded-lg
                hover:bg-slate-800
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              {submitting ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}

              {submitting ? "Saving..." : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Purchase History</h2>

              <p className="text-sm text-slate-500 mt-1">
                All purchases from Fort Alpha
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {purchases.length} Records
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw
              size={24}
              className="animate-spin mx-auto text-slate-400"
            />

            <p className="text-slate-500 mt-3">Loading purchases...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-10 text-center">
            <Package size={40} className="mx-auto text-slate-300" />

            <p className="text-slate-600 font-medium mt-3">
              No purchases found
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Add a purchase using the form above.
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
                    Category
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="
                        border-t
                        border-slate-100
                        hover:bg-slate-50
                        transition
                      "
                  >
                    <td className="px-5 py-3 font-medium text-slate-700">
                      #{purchase.id}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {purchase.base?.name || "Fort Alpha"}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {purchase.equipmentType?.name ||
                        `Equipment #${purchase.equipmentTypeId}`}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {purchase.equipmentType?.category || "-"}
                    </td>

                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-900">
                        {Number(purchase.quantity || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(
                        purchase.purchaseDate ||
                          purchase.date ||
                          purchase.createdAt,
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

export default Purchases;
