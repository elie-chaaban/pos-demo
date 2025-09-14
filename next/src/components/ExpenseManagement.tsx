"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { toast } from "sonner";
import LoadingButton from "./LoadingButton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Expense {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  category: {
    id: string;
    name: string;
  };
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
}

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    categoryId: "",
    amount: 0,
    paymentMethod: "Cash",
    notes: "",
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/expense-categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingExpense
        ? `/api/expenses/${editingExpense.id}`
        : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchExpenses();
        setShowModal(false);
        setEditingExpense(null);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          description: "",
          categoryId: "",
          amount: 0,
          paymentMethod: "Cash",
          notes: "",
        });
        toast.success(
          editingExpense
            ? "Expense updated successfully!"
            : "Expense added successfully!"
        );
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Error saving expense. Please try again.");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date.split("T")[0],
      description: expense.description,
      categoryId: expense.categoryId,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchExpenses();
        setShowDeleteModal(false);
        setExpenseToDelete(null);
        toast.success("Expense deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Error deleting expense. Please try again.");
    }
  };

  const openModal = () => {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      categoryId: "",
      amount: 0,
      paymentMethod: "Cash",
      notes: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      categoryId: "",
      amount: 0,
      paymentMethod: "Cash",
      notes: "",
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
            Loading Expenses
          </div>
          <div className="text-gray-500">Fetching expense data...</div>
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
                {formatNumber(expenses.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Expenses
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + expense.amount, 0)
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Amount
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + expense.amount, 0) /
                    Math.max(expenses.length, 1)
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">Average</div>
            </div>
          </div>
          <LoadingButton
            onClick={openModal}
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            icon={<Plus className="w-5 h-5" />}
          >
            Add Expense
          </LoadingButton>
        </div>
      </div>

      {/* Modern Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((expense) => {
          const getPaymentMethodColor = (method: string) => {
            switch (method) {
              case "Cash":
                return "from-green-500 to-emerald-600";
              case "Credit Card":
                return "from-blue-500 to-cyan-600";
              case "Debit Card":
                return "from-purple-500 to-indigo-600";
              case "Bank Transfer":
                return "from-orange-500 to-red-600";
              case "Check":
                return "from-yellow-500 to-orange-600";
              default:
                return "from-gray-500 to-gray-600";
            }
          };

          return (
            <div key={expense.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getPaymentMethodColor(
                    expense.paymentMethod
                  )} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-lg">
                    {expense.paymentMethod.charAt(0)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    {expense.category.name}
                  </span>
                  <LoadingButton
                    onClick={() => handleEdit(expense)}
                    variant="secondary"
                    size="sm"
                    className="p-2"
                    icon={<Edit className="w-4 h-4" />}
                  />
                  <LoadingButton
                    onClick={() => handleDelete(expense)}
                    variant="danger"
                    size="sm"
                    className="p-2"
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {expense.description}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Payment:</span>
                  <span className="font-bold text-indigo-600">
                    {expense.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
                {expense.notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{expense.notes}</p>
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
                {editingExpense ? "Edit Expense" : "Add New Expense"}
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
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Enter expense description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="input-modern"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="input-modern"
                  placeholder="Enter additional notes (optional)"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <LoadingButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                >
                  {editingExpense ? "Update Expense" : "Add Expense"}
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
          setExpenseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        itemName={expenseToDelete?.description}
      />
    </div>
  );
}
