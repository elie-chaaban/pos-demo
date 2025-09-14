"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { toast } from "sonner";
import LoadingButton from "./LoadingButton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface InventoryRecord {
  id: string;
  date: string;
  itemId: string;
  type: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  cogsTotal?: number;
  item: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
  sale?: {
    id: string;
    customer?: {
      name: string;
    };
  };
}

interface Item {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  stock: number;
  averageCost: number;
  isService: boolean;
}

export default function InventoryManagement() {
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(
    []
  );
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<InventoryRecord | null>(
    null
  );
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    itemId: "",
    type: "Purchase",
    quantity: 0,
    unitCost: 0,
  });

  useEffect(() => {
    fetchInventoryRecords();
    fetchItems();
  }, []);

  const fetchInventoryRecords = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventoryRecords(data);
    } catch (error) {
      console.error("Error fetching inventory records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items?forInventory=true");
      const data = await response.json();
      // Filter out services on frontend as backup
      const stockItems = data.filter((item: Item) => !item.isService);
      setItems(stockItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingRecord
        ? `/api/inventory/${editingRecord.id}`
        : "/api/inventory";
      const method = editingRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchInventoryRecords();
        await fetchItems(); // Refresh items to update stock
        setShowModal(false);
        setEditingRecord(null);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          itemId: "",
          type: "Purchase",
          quantity: 0,
          unitCost: 0,
        });
        toast.success(
          editingRecord
            ? "Inventory record updated successfully!"
            : "Inventory record added successfully!"
        );
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving inventory record:", error);
      toast.error("Error saving inventory record. Please try again.");
    }
  };

  const handleEdit = (record: InventoryRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date.split("T")[0],
      itemId: record.itemId,
      type: record.type,
      quantity: record.quantity,
      unitCost: record.unitCost,
    });
    setShowModal(true);
  };

  const handleDelete = (record: InventoryRecord) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (!recordToDelete) return;

    try {
      const response = await fetch(`/api/inventory/${recordToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchInventoryRecords();
        await fetchItems(); // Refresh items to update stock
        toast.success("Inventory record deleted successfully!");
        setRecordToDelete(null);
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting inventory record:", error);
      toast.error("Error deleting inventory record. Please try again.");
    }
  };

  const openModal = () => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      itemId: "",
      type: "Purchase",
      quantity: 0,
      unitCost: 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      itemId: "",
      type: "Purchase",
      quantity: 0,
      unitCost: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading Inventory
          </div>
          <div className="text-gray-500">Fetching inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-8">
      {/* Modern Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {formatNumber(inventoryRecords.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Records
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(
                  inventoryRecords.reduce(
                    (sum, record) => sum + record.totalCost,
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Value
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatNumber(
                  inventoryRecords.filter((r) => r.type === "Purchase").length
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">Purchases</div>
            </div>
          </div>
          <LoadingButton
            onClick={openModal}
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            icon={<Plus className="w-5 h-5" />}
          >
            Add Stock
          </LoadingButton>
        </div>
      </div>

      {/* Modern Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryRecords.map((record) => {
          const getTypeGradient = (type: string) => {
            switch (type) {
              case "Purchase":
                return "from-green-500 to-emerald-600";
              case "Usage":
                return "from-red-500 to-rose-600";
              case "Return":
                return "from-blue-500 to-cyan-600";
              case "Adjustment":
                return "from-yellow-500 to-orange-600";
              default:
                return "from-gray-500 to-gray-600";
            }
          };

          return (
            <div key={record.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getTypeGradient(
                    record.type
                  )} rounded-full flex items-center justify-center`}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTypeGradient(
                      record.type
                    )} text-white`}
                  >
                    {record.type}
                  </span>
                  <LoadingButton
                    onClick={() => handleEdit(record)}
                    variant="secondary"
                    size="sm"
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    icon={<Edit className="w-4 h-4" />}
                  />
                  <LoadingButton
                    onClick={() => handleDelete(record)}
                    variant="danger"
                    size="sm"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {record.item.name}
              </h3>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                {record.item.category.name}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <span className="font-bold text-indigo-600">
                    {record.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Unit Cost:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(record.unitCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600 font-medium">Total Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(record.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRecord ? "Edit Inventory Record" : "Add Stock Record"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="input-modern"
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Usage">Usage</option>
                    <option value="Return">Return</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item
                </label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  className="input-modern"
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category.name}) - Stock: {item.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(formData.quantity * formData.unitCost)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <LoadingButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                >
                  {editingRecord ? "Update Record" : "Add Record"}
                </LoadingButton>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecordToDelete(null);
        }}
        onConfirm={performDelete}
        title="Delete Inventory Record"
        message="Are you sure you want to delete this inventory record? This action will permanently remove the record and may affect stock calculations."
        itemName={
          recordToDelete
            ? `${recordToDelete.item.name} - ${recordToDelete.type}`
            : undefined
        }
      />
    </div>
  );
}
