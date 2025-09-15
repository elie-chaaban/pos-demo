"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { formatNumber } from "../lib/utils";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import LoadingButton from "./LoadingButton";
import {
  Employee,
  EmployeeService,
  Item,
  EmployeeFormData,
  ServiceFormData,
} from "../types";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeServices, setEmployeeServices] = useState<EmployeeService[]>(
    []
  );
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    email: undefined,
    phone: undefined,
  });
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    itemId: "",
    commissionRate: 0,
  });
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] =
    useState<EmployeeService | null>(null);
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(
    null
  );
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, { commissionRate: number; isActive: boolean }>
  >({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResponse, itemsResponse] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/items"),
      ]);

      const employeesData = await employeesResponse.json();
      const itemsData = await itemsResponse.json();

      setEmployees(employeesData);
      setServices(itemsData); // Show all items (both services and products)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeServices = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/services`);
      const data = await response.json();
      setEmployeeServices(data);
    } catch (error) {
      console.error("Error fetching employee services:", error);
    }
  };

  const performEmployeeSubmit = async () => {
    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";
      const method = editingEmployee ? "PUT" : "POST";

      const requestData = {
        name: formData.name,
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
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
          email: undefined,
          phone: undefined,
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
      email: employee.email || undefined,
      phone: employee.phone || undefined,
    });
    setShowModal(true);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteEmployeeModal(true);
  };

  const performDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        toast.success("Employee deleted successfully!");
        setShowDeleteEmployeeModal(false);
        setEmployeeToDelete(null);
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
      email: undefined,
      phone: undefined,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: undefined,
      phone: undefined,
    });
  };

  // Helper function to handle role selection

  // Service management functions
  const openServiceModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setServiceFormData({
      itemId: "",
      commissionRate: 0,
    });
    fetchEmployeeServices(employee.id);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setSelectedEmployee(null);
    setEmployeeServices([]);
    setServiceFormData({
      itemId: "",
      commissionRate: 0,
    });
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performServiceAdd();
  };

  const performServiceAdd = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(
        `/api/employees/${selectedEmployee.id}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceFormData),
        }
      );

      if (response.ok) {
        await fetchEmployeeServices(selectedEmployee.id);
        setServiceFormData({
          itemId: "",
          commissionRate: 0,
        });
        toast.success("Item/Service added successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Error adding item/service. Please try again.");
    }
  };

  const handleServiceUpdate = async (
    serviceId: string,
    commissionRate: number,
    isActive: boolean,
    isActiveChanged: boolean = false
  ) => {
    // Only show progress modal if the active status is changing
    if (isActiveChanged) {
      setProgressMessage(
        isActive ? "Activating item/service..." : "Deactivating item/service..."
      );
      setShowProgressModal(true);
    }

    try {
      const response = await fetch(
        `/api/employees/${selectedEmployee?.id}/services/${serviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionRate,
            isActive,
          }),
        }
      );

      if (response.ok) {
        await fetchEmployeeServices(selectedEmployee!.id);
        toast.success("Item/Service updated successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Error updating item/service. Please try again.");
    } finally {
      if (isActiveChanged) {
        setShowProgressModal(false);
      }
    }
  };

  const handleServiceFieldChange = (
    serviceId: string,
    field: "commissionRate" | "isActive",
    value: number | boolean
  ) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
        // Preserve the other field if it exists, otherwise use current values
        commissionRate:
          field === "commissionRate"
            ? (value as number)
            : prev[serviceId]?.commissionRate ??
              employeeServices.find((es) => es.id === serviceId)
                ?.commissionRate ??
              0,
        isActive:
          field === "isActive"
            ? (value as boolean)
            : prev[serviceId]?.isActive ??
              employeeServices.find((es) => es.id === serviceId)?.isActive ??
              true,
      },
    }));
  };

  const handleServiceUpdateButton = async (serviceId: string) => {
    const pendingUpdate = pendingUpdates[serviceId];
    if (!pendingUpdate) return;

    setUpdatingServiceId(serviceId);

    try {
      const response = await fetch(
        `/api/employees/${selectedEmployee?.id}/services/${serviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionRate: pendingUpdate.commissionRate,
            isActive: pendingUpdate.isActive,
          }),
        }
      );

      if (response.ok) {
        await fetchEmployeeServices(selectedEmployee!.id);
        // Clear the pending update for this service
        setPendingUpdates((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[serviceId];
          return newUpdates;
        });
        toast.success("Item/Service updated successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Error updating item/service. Please try again.");
    } finally {
      setUpdatingServiceId(null);
    }
  };

  const handleServiceDelete = (employeeService: EmployeeService) => {
    setServiceToDelete(employeeService);
    setShowDeleteServiceModal(true);
  };

  const performServiceDelete = async () => {
    if (!serviceToDelete || !selectedEmployee) return;

    try {
      const response = await fetch(
        `/api/employees/${selectedEmployee.id}/services/${serviceToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchEmployeeServices(selectedEmployee.id);
        toast.success("Item/Service deleted successfully!");
        setShowDeleteServiceModal(false);
        setServiceToDelete(null);
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error deleting item/service. Please try again.");
    }
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
          </div>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
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
                    onClick={() => openServiceModal(employee)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                    title="Manage Items/Services & Commission"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Employee"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {employee.name}
              </h3>

              <div className="space-y-3">
                {employee.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">
                      {employee.email}
                    </span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">
                      {employee.phone}
                    </span>
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
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
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
                  Email Address{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-modern"
                  placeholder="employee@salon.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number{" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input-modern"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <LoadingButton
                  onClick={performEmployeeSubmit}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  {editingEmployee ? "Update Employee" : "Add Employee"}
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

      {/* Service Management Modal */}
      {showServiceModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Items/Services & Commission - {selectedEmployee.name}
              </h2>
              <button
                onClick={closeServiceModal}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Service */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Item/Service
                </h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Item/Service
                    </label>
                    <select
                      required
                      value={serviceFormData.itemId}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          itemId: e.target.value,
                        })
                      }
                      className="input-modern"
                    >
                      <option value="">Choose an item/service...</option>
                      {services
                        .filter(
                          (service) =>
                            !employeeServices.some(
                              (es) => es.itemId === service.id
                            )
                        )
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={serviceFormData.commissionRate}
                      onChange={(e) => {
                        let newRate = parseFloat(e.target.value) || 0;
                        // Enforce min/max constraints
                        newRate = Math.max(0, Math.min(100, newRate));
                        setServiceFormData({
                          ...serviceFormData,
                          commissionRate: newRate,
                        });
                      }}
                      className="input-modern"
                      placeholder="0.0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Salon owner will receive:{" "}
                      {100 - serviceFormData.commissionRate}%
                    </p>
                  </div>

                  <LoadingButton
                    onClick={performServiceAdd}
                    variant="success"
                    size="lg"
                    className="w-full"
                  >
                    Add Item/Service
                  </LoadingButton>
                </form>
              </div>

              {/* Current Services */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Items/Services
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {employeeServices.length > 0 ? (
                    employeeServices.map((employeeService) => (
                      <div
                        key={employeeService.id}
                        className={`p-4 rounded-lg border-2 ${
                          employeeService.isActive
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {employeeService.item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ${employeeService.item.price}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleServiceDelete(employeeService)
                              }
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete Item/Service"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Employee Commission Rate (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={
                              pendingUpdates[employeeService.id]
                                ?.commissionRate ??
                              employeeService.commissionRate
                            }
                            onChange={(e) => {
                              let newRate = parseFloat(e.target.value) || 0;
                              // Enforce min/max constraints
                              newRate = Math.max(0, Math.min(100, newRate));
                              handleServiceFieldChange(
                                employeeService.id,
                                "commissionRate",
                                newRate
                              );
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Salon owner receives:{" "}
                            {100 -
                              (pendingUpdates[employeeService.id]
                                ?.commissionRate ??
                                employeeService.commissionRate)}
                            %
                          </p>
                        </div>

                        <div className="mt-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={
                                pendingUpdates[employeeService.id]?.isActive ??
                                employeeService.isActive
                              }
                              onChange={(e) => {
                                handleServiceFieldChange(
                                  employeeService.id,
                                  "isActive",
                                  e.target.checked
                                );
                              }}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Active Item/Service
                            </span>
                          </label>
                        </div>

                        {/* Update Button */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <LoadingButton
                            onClick={() =>
                              handleServiceUpdateButton(employeeService.id)
                            }
                            variant="success"
                            size="sm"
                            disabled={
                              updatingServiceId === employeeService.id ||
                              !pendingUpdates[employeeService.id]
                            }
                            className="w-full"
                          >
                            {updatingServiceId === employeeService.id
                              ? "Updating..."
                              : "Update Changes"}
                          </LoadingButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items/services assigned yet.</p>
                      <p className="text-sm">
                        Add items/services using the form on the left.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={closeServiceModal}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteServiceModal}
        onClose={() => {
          setShowDeleteServiceModal(false);
          setServiceToDelete(null);
        }}
        onConfirm={performServiceDelete}
        title="Delete Item/Service"
        message={
          serviceToDelete
            ? `Are you sure you want to remove "${serviceToDelete.item.name}" from ${selectedEmployee?.name}'s commission list? This action cannot be undone.`
            : ""
        }
        itemName={serviceToDelete?.item.name}
      />

      {/* Delete Employee Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteEmployeeModal}
        onClose={() => {
          setShowDeleteEmployeeModal(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={performDelete}
        title="Delete Employee"
        message={
          employeeToDelete
            ? `Are you sure you want to delete "${employeeToDelete.name}"? This will permanently remove the employee and all associated data including their commission settings.`
            : ""
        }
        itemName={employeeToDelete?.name}
      />

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Updating Item/Service
              </h3>
              <p className="text-gray-600">{progressMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
