"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatNumber } from "../lib/utils";
import { toast } from "sonner";

interface UserRole {
  id: string;
  name: string;
  description: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeRoles: Array<{
    id: string;
    role: UserRole;
  }>;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    selectedRoleIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResponse, rolesResponse] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/user-roles"),
      ]);

      const employeesData = await employeesResponse.json();
      const rolesData = await rolesResponse.json();

      setEmployees(employeesData);
      setUserRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";
      const method = editingEmployee ? "PUT" : "POST";

      const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
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
        setEditingEmployee(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          selectedRoleIds: [],
        });
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Error saving employee. Please try again.");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      selectedRoleIds: employee.employeeRoles.map((er) => er.role.id),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    toast("Are you sure you want to delete this employee?", {
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
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Error deleting employee. Please try again.");
    }
  };

  const openModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      selectedRoleIds: [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
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
            Loading Employees
          </div>
          <div className="text-gray-500">Fetching employee data...</div>
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
                {formatNumber(employees.length)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Total Employees
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(
                  employees.filter((e) =>
                    e.employeeRoles.some((er) => er.role.name === "Hairdresser")
                  ).length
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Hairdressers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatNumber(
                  employees.filter((e) =>
                    e.employeeRoles.some(
                      (er) => er.role.name === "Nail Technician"
                    )
                  ).length
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Nail Techs
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Modern Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => {
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
            <div key={employee.id} className="modern-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(
                    employee.name
                  )} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {employee.name}
              </h3>
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {employee.employeeRoles &&
                  employee.employeeRoles.length > 0 ? (
                    employee.employeeRoles.map((employeeRole) => (
                      <span
                        key={employeeRole.role.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {employeeRole.role.name}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">
                    {employee.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">
                    {employee.phone}
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
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
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-modern"
                  placeholder="Enter employee's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-modern"
                  placeholder="employee@salon.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input-modern"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Employee Roles
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
                  Select one or more roles for this employee
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingEmployee ? "Update Employee" : "Add Employee"}
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
