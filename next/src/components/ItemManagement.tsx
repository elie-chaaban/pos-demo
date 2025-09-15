"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { toast } from "sonner";
import LoadingButton from "./LoadingButton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  isService: boolean;
  description?: string;
  averageCost?: number;
}

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stock: 0,
    isService: false,
    description: "",
    reorderThreshold: 5,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchItems();
        setShowModal(false);
        setEditingItem(null);
        setFormData({
          name: "",
          price: 0,
          stock: 0,
          isService: false,
          description: "",
          reorderThreshold: 5,
        });
        toast.success(
          editingItem
            ? "Item updated successfully!"
            : "Item added successfully!"
        );
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Error saving item. Please try again.");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      stock: item.stock,
      isService: item.isService,
      description: item.description || "",
      reorderThreshold: item.reorderThreshold || 5,
    });
    setShowModal(true);
  };

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchItems();
        toast.success("Item deleted successfully!");
        setItemToDelete(null);
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item. Please try again.");
    }
  };

  const openModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      price: 0,
      stock: 0,
      isService: false,
      description: "",
      reorderThreshold: 5,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: "",
      price: 0,
      stock: 0,
      isService: false,
      description: "",
      reorderThreshold: 5,
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
            Loading Items
          </div>
          <div className="text-gray-500">Fetching product data...</div>
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
                {formatNumber(items.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Items
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(
                  items
                    .filter((item) => !item.isService)
                    .reduce(
                      (sum, item) => sum + (item.averageCost || 0) * item.stock,
                      0
                    )
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Inventory Value
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {items.filter((item) => item.isService).length}
              </div>
              <div className="text-sm text-gray-500 font-medium">Services</div>
            </div>
          </div>
          <LoadingButton
            onClick={openModal}
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            icon={<Plus className="w-5 h-5" />}
          >
            Add Item
          </LoadingButton>
        </div>
      </div>

      {/* Modern Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isLowStock = !item.isService && item.stock <= 5;
          const isOutOfStock = !item.isService && item.stock === 0;

          return (
            <div key={item.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.isService
                      ? "bg-gradient-to-r from-purple-500 to-pink-600"
                      : "bg-gradient-to-r from-blue-500 to-cyan-600"
                  }`}
                >
                  <span className="text-white font-bold text-lg">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {item.isService && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Service
                    </span>
                  )}
                  {!item.isService && isLowStock && !isOutOfStock && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Low Stock
                    </span>
                  )}
                  {!item.isService && isOutOfStock && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Out of Stock
                    </span>
                  )}
                  <LoadingButton
                    onClick={() => handleEdit(item)}
                    variant="secondary"
                    size="sm"
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    icon={<Edit className="w-4 h-4" />}
                  />
                  <LoadingButton
                    onClick={() => handleDelete(item)}
                    variant="danger"
                    size="sm"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                {!item.isService && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Stock:</span>
                    <span
                      className={`font-bold ${
                        isOutOfStock
                          ? "text-red-600"
                          : isLowStock
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatNumber(item.stock)} units
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Avg Cost:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.averageCost || 0)}
                  </span>
                </div>
                {item.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? "Edit Item" : "Add New Item"}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isService}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isService: e.target.checked,
                        stock: e.target.checked ? 0 : formData.stock, // Reset stock when service is checked
                      })
                    }
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    This is a service item (no inventory tracking)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.00"
                  />
                </div>

                {!formData.isService && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="input-modern"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reorder Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.reorderThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reorderThreshold: parseInt(e.target.value) || 5,
                          })
                        }
                        className="input-modern"
                        placeholder="5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Alert when stock falls below this level
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="input-modern"
                  placeholder="Enter item description (optional)"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <LoadingButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                >
                  {editingItem ? "Update Item" : "Add Item"}
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
          setItemToDelete(null);
        }}
        onConfirm={performDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action will permanently remove the item and all its associated data."
        itemName={itemToDelete?.name}
      />
    </div>
  );
}
