"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatNumber } from "../lib/utils";
import { toast } from "sonner";
import LoadingButton from "./LoadingButton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface UserRole {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  commissionRate: number;
  salonOwnerRate: number;
  description: string;
  categoryRoles: Array<{
    id: string;
    role: UserRole;
  }>;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    commissionRate: 0,
    salonOwnerRate: 0,
    description: "",
    selectedRoleIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, rolesResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/user-roles"),
      ]);

      const categoriesData = await categoriesResponse.json();
      const rolesData = await rolesResponse.json();

      setCategories(categoriesData);
      setUserRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const requestData = {
        name: formData.name,
        commissionRate: formData.commissionRate,
        salonOwnerRate: formData.salonOwnerRate,
        description: formData.description,
        roleIds: formData.selectedRoleIds,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        await fetchData();
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
          name: "",
          commissionRate: 0,
          salonOwnerRate: 0,
          description: "",
          selectedRoleIds: [],
        });
        toast.success(
          editingCategory
            ? "Category updated successfully!"
            : "Category added successfully!"
        );
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error saving category. Please try again.");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      commissionRate: category.commissionRate,
      salonOwnerRate: category.salonOwnerRate,
      description: category.description,
      selectedRoleIds: category.categoryRoles.map((cr) => cr.role.id),
    });
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        toast.success("Category deleted successfully!");
        setCategoryToDelete(null);
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.");
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      commissionRate: 0,
      salonOwnerRate: 0,
      description: "",
      selectedRoleIds: [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      commissionRate: 0,
      salonOwnerRate: 0,
      description: "",
      selectedRoleIds: [],
    });
  };

  // Helper function to handle role selection
  const handleRoleToggle = (roleId: string) => {
    const newRoleIds = formData.selectedRoleIds.includes(roleId)
      ? formData.selectedRoleIds.filter((id: string) => id !== roleId)
      : [...formData.selectedRoleIds, roleId];
    setFormData({ ...formData, selectedRoleIds: newRoleIds });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading Categories
          </div>
          <div className="text-gray-500">Fetching category data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-8">
      {/* Modern Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {formatNumber(categories.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Categories
              </div>
            </div>
          </div>
          <LoadingButton
            onClick={openModal}
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            icon={<Plus className="w-5 h-5" />}
          >
            Add Category
          </LoadingButton>
        </div>
      </div>

      {/* Modern Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const getCategoryColor = (name: string) => {
            const colors = [
              "from-pink-500 to-rose-600",
              "from-blue-500 to-cyan-600",
              "from-purple-500 to-indigo-600",
              "from-green-500 to-emerald-600",
              "from-yellow-500 to-orange-600",
              "from-red-500 to-pink-600",
            ];
            const index = name.length % colors.length;
            return colors[index];
          };

          return (
            <div key={category.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(
                    category.name
                  )} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-lg">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <LoadingButton
                    onClick={() => handleEdit(category)}
                    variant="secondary"
                    size="sm"
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    icon={<Edit className="w-4 h-4" />}
                  />
                  <LoadingButton
                    onClick={() => handleDelete(category)}
                    variant="danger"
                    size="sm"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    icon={<Trash2 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">
                    Employee Commission:
                  </span>
                  <span className="font-bold text-green-600">
                    {category.commissionRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">
                    Salon Owner Rate:
                  </span>
                  <span className="font-bold text-purple-600">
                    {category.salonOwnerRate}%
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="mb-2">
                    <span className="text-gray-600 font-medium text-sm">
                      Allowed Roles:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {category.categoryRoles &&
                      category.categoryRoles.length > 0 ? (
                        category.categoryRoles.map((categoryRole) => (
                          <span
                            key={categoryRole.role.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {categoryRole.role.name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
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
                {editingCategory ? "Edit Category" : "Add New Category"}
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
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Enter category name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee Commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Salon Owner Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.salonOwnerRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salonOwnerRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="input-modern"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Allowed Employee Roles
                </label>
                {userRoles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {userRoles.map((role) => {
                      const isSelected = formData.selectedRoleIds.includes(
                        role.id
                      );
                      return (
                        <label
                          key={role.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRoleToggle(role.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <span
                              className={`font-medium ${
                                isSelected ? "text-indigo-700" : "text-gray-700"
                              }`}
                            >
                              {role.name}
                            </span>
                            <p
                              className={`text-xs ${
                                isSelected ? "text-indigo-600" : "text-gray-500"
                              }`}
                            >
                              {role.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No user roles available.</p>
                    <p className="text-sm">Please create user roles first.</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Select which employee roles can be assigned to items in this
                  category
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <LoadingButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                >
                  {editingCategory ? "Update Category" : "Add Category"}
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
          setCategoryToDelete(null);
        }}
        onConfirm={performDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action will permanently remove the category and all its associated data."
        itemName={categoryToDelete?.name}
      />
    </div>
  );
}
