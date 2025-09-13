"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  isService: boolean;
  description?: string;
  averageCost?: number;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  commissionRate: number;
  salonOwnerRate: number;
  description: string;
}

export default function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: 0,
    stock: 0,
    isService: false,
    description: "",
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          categoryId: "",
          price: 0,
          stock: 0,
          isService: false,
          description: "",
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item. Please try again.");
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      stock: item.stock,
      isService: item.isService,
      description: item.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchItems();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  const openModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: "",
      price: 0,
      stock: 0,
      isService: false,
      description: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: "",
      price: 0,
      stock: 0,
      isService: false,
      description: "",
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
                {items.length}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Items
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                $
                {items
                  .filter((item) => !item.isService)
                  .reduce((sum, item) => sum + item.price * item.stock, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Inventory Value
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {
                  items.filter((item) => !item.isService && item.stock <= 5)
                    .length
                }
              </div>
              <div className="text-sm text-gray-500 font-medium">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {items.filter((item) => item.isService).length}
              </div>
              <div className="text-sm text-gray-500 font-medium">Services</div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
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
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.name}
              </h3>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                {item.category.name}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${item.price.toFixed(2)}
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
                      {item.stock} units
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Avg Cost:</span>
                  <span className="font-bold text-gray-900">
                    ${(item.averageCost || 0).toFixed(2)}
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="input-modern"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
