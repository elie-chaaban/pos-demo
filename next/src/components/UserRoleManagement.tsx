"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { formatNumber } from "../lib/utils";
import { toast } from "sonner";

interface UserRole {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  categoryRoles?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  employeeRoles?: Array<{
    employee: {
      id: string;
      name: string;
    };
  }>;
}

export default function UserRoleManagement() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await fetch("/api/user-roles");
      const data = await response.json();
      setUserRoles(data);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRole
        ? `/api/user-roles/${editingRole.id}`
        : "/api/user-roles";
      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUserRoles();
        setShowModal(false);
        setEditingRole(null);
        setFormData({
          name: "",
          description: "",
        });
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving user role:", error);
      toast.error("Error saving user role. Please try again.");
    }
  };

  const handleEdit = (role: UserRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this user role?", {
      action: {
        label: "Delete",
        onClick: () => performDelete(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const performDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/user-roles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUserRoles();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting user role:", error);
      toast.error("Error deleting user role. Please try again.");
    }
  };

  const openModal = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: "",
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
            Loading User Roles
          </div>
          <div className="text-gray-500">Fetching role data...</div>
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
                {formatNumber(userRoles.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Roles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(
                  userRoles.reduce(
                    (sum, role) => sum + (role.employeeRoles?.length || 0),
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Employees
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatNumber(
                  userRoles.reduce(
                    (sum, role) => sum + (role.categoryRoles?.length || 0),
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Category Assignments
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Modern Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userRoles.map((role) => {
          const getRoleColor = (name: string) => {
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
            <div key={role.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(
                    role.name
                  )} rounded-full flex items-center justify-center`}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {role.name}
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">{role.description}</p>

                <div className="pt-2 border-t border-gray-200">
                  <div className="mb-2">
                    <span className="text-gray-600 font-medium text-sm">
                      Used in Categories:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.categoryRoles && role.categoryRoles.length > 0 ? (
                        role.categoryRoles.map((categoryRole) => (
                          <span
                            key={categoryRole.category.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                          >
                            {categoryRole.category.name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                          No categories assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-gray-600 font-medium text-sm">
                      Employees ({formatNumber(role.employeeRoles?.length || 0)}
                      ):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.employeeRoles && role.employeeRoles.length > 0 ? (
                        role.employeeRoles.slice(0, 3).map((employeeRole) => (
                          <span
                            key={employeeRole.employee.id}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                          >
                            {employeeRole.employee.name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                          No employees assigned
                        </span>
                      )}
                      {role.employeeRoles && role.employeeRoles.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                          +{formatNumber(role.employeeRoles.length - 3)} more
                        </span>
                      )}
                    </div>
                  </div>
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
                {editingRole ? "Edit User Role" : "Add New User Role"}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Enter role name (e.g., Laser Technician)"
                />
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
                  placeholder="Enter role description"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {editingRole ? "Update Role" : "Add Role"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
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
