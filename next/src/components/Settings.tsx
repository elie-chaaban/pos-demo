"use client";

import { useState, useEffect } from "react";
import { Save, Calculator, Package } from "lucide-react";

interface Settings {
  costingMethod?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading Settings
          </div>
          <div className="text-gray-500">Fetching system configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-8">
      {/* Modern Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              System Settings
            </h1>
            <p className="text-gray-600">
              Configure your salon management system
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            <Save className={`w-5 h-5 ${saving ? "animate-pulse" : ""}`} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-6 rounded-2xl border-2 ${
            message.type === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200"
              : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                message.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="font-semibold">{message.text}</span>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Modern Inventory Costing Method */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Inventory Costing Method
              </h3>
              <p className="text-gray-600">
                Configure how inventory costs are calculated
              </p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Choose how to calculate the cost of goods sold when items are used
            or sold.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costing Method:
              </label>
              <select
                value={settings.costingMethod || "LIFO"}
                onChange={(e) =>
                  handleInputChange("costingMethod", e.target.value)
                }
                className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="LIFO">LIFO (Last In, First Out)</option>
                <option value="WeightedAverage">Weighted Average Cost</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>LIFO:</strong> Uses the cost of the newest inventory
                first
                <br />
                <strong>Weighted Average:</strong> Uses the average cost of all
                inventory
              </div>
            </div>
          </div>
        </div>

        {/* Costing Method Examples */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Costing Method Examples
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                LIFO Example:
              </h4>
              <div className="text-sm text-green-700 space-y-2">
                <p>You buy 100 items at $8 each, then 50 items at $10 each.</p>
                <p>
                  When you sell 30 items, the cost is calculated using the
                  newest batch first:
                </p>
                <ul className="list-disc list-inside ml-2">
                  <li>30 items × $10 = $300 (from second batch)</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Weighted Average Example:
              </h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>You buy 100 items at $8 each, then 50 items at $10 each.</p>
                <p>Average cost = (100×$8 + 50×$10) ÷ 150 = $8.67</p>
                <p>When you sell 30 items: 30 × $8.67 = $260</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
