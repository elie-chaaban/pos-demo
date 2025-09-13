"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  CreditCard,
  Plus,
  Minus,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  isService: boolean;
  description?: string;
  category: {
    id: string;
    name: string;
    commissionRate: number;
    salonOwnerRate: number;
    categoryRoles: {
      role: {
        id: string;
        name: string;
      };
    }[];
  };
}

interface Employee {
  id: string;
  name: string;
  employeeRoles: {
    role: {
      id: string;
      name: string;
    };
  }[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface CartItem {
  id: string;
  quantity: number;
  employeeId: string;
}

export default function POSInterface() {
  const [items, setItems] = useState<Item[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, employeesRes, customersRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/employees"),
        fetch("/api/customers"),
      ]);

      const [itemsData, employeesData, customersData] = await Promise.all([
        itemsRes.json(),
        employeesRes.json(),
        customersRes.json(),
      ]);

      setItems(itemsData);
      setEmployees(employeesData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Check if it's a physical product that needs stock tracking
    if (!item.isService && item.stock <= 0) {
      alert("Item out of stock!");
      return;
    }

    const existingItem = cart.find((cartItem) => cartItem.id === itemId);
    if (existingItem) {
      if (!item.isService && existingItem.quantity >= item.stock) {
        alert("Not enough stock available!");
        return;
      }
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      // Get appropriate employee based on category
      const filteredEmployees = getFilteredEmployeesForItem(itemId);
      const defaultEmployee = filteredEmployees[0] || employees[0];

      setCart([
        ...cart,
        {
          id: itemId,
          quantity: 1,
          employeeId: defaultEmployee.id,
        },
      ]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    const cartItem = cart.find((item) => item.id === itemId);
    if (!cartItem) return;

    const item = items.find((i) => i.id === itemId);
    const newQuantity = cartItem.quantity + change;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (item && !item.isService && newQuantity > item.stock) {
      alert("Not enough stock available!");
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const setItemEmployee = (itemId: string, employeeId: string) => {
    setCart(
      cart.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, employeeId } : cartItem
      )
    );
  };

  // Function to get filtered employees for a specific item
  const getFilteredEmployeesForItem = (itemId: string): Employee[] => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return employees;

    // Get allowed role names for this category
    const allowedRoleNames = item.category.categoryRoles.map(
      (cr) => cr.role.name
    );

    // If no roles are specified for this category, return all employees
    if (allowedRoleNames.length === 0) {
      return employees;
    }

    // Filter employees who have at least one of the allowed roles
    return employees.filter((emp) =>
      emp.employeeRoles.some((er) => allowedRoleNames.includes(er.role.name))
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer("");
  };

  const addNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Please fill in name and phone fields");
      return;
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const createdCustomer = await response.json();
        setCustomers([...customers, createdCustomer]);
        setSelectedCustomer(createdCustomer.id);
        setShowAddCustomer(false);
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          address: "",
          dateOfBirth: "",
        });
        alert("Customer added successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Error creating customer. Please try again.");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => {
      const item = items.find((i) => i.id === cartItem.id);
      return sum + (item ? item.price * cartItem.quantity : 0);
    }, 0);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const total = calculateTotal();

    const saleItems = cart.map((cartItem) => {
      const item = items.find((i) => i.id === cartItem.id)!;
      return {
        itemId: cartItem.id,
        employeeId: cartItem.employeeId,
        quantity: cartItem.quantity,
        price: item.price,
        total: item.price * cartItem.quantity,
      };
    });

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          items: saleItems,
          total,
        }),
      });

      if (response.ok) {
        alert("Sale completed successfully!");
        clearCart();
        fetchData(); // Refresh data to update stock
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Error during checkout. Please try again.");
    }
  };

  const total = calculateTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Loading POS System
          </div>
          <div className="text-gray-500">Preparing your workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Compact Stats Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="status-online"></div>
              <span className="text-sm font-semibold text-gray-700">
                System Online
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">
                  {items.length}
                </div>
                <div className="text-xs text-gray-500 font-medium">Items</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {cart.length}
                </div>
                <div className="text-xs text-gray-500 font-medium">In Cart</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  ${total.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Modern Items Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Products & Services
                </h3>
                <p className="text-gray-600 text-sm">
                  Select items to add to cart
                </p>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-semibold text-sm">
                {filteredItems.length} of {items.length}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
              {filteredItems.map((item) => {
                const isLowStock = !item.isService && item.stock <= 5;
                const isOutOfStock = !item.isService && item.stock === 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item.id)}
                    className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300 ${
                      isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight flex-1">
                        {item.name}
                      </h4>
                      {isLowStock && !isOutOfStock && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold ml-2">
                          Low
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold ml-2">
                          Out
                        </span>
                      )}
                    </div>

                    <div className="text-xl font-bold text-green-600 mb-3">
                      ${item.price.toFixed(2)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.isService
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.isService ? "Service" : `Stock: ${item.stock}`}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {item.category.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modern Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden order-first lg:order-last">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Shopping Cart
                </h3>
                <p className="text-gray-600 text-sm">Review your order</p>
              </div>
              {cart.length > 0 && (
                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold text-sm">
                  {cart.length} items
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold">No items in cart</p>
                <p className="text-gray-500 text-sm mt-1">
                  Add items to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((cartItem) => {
                  const item = items.find((i) => i.id === cartItem.id)!;

                  return (
                    <div
                      key={cartItem.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Employee:
                        </label>
                        <select
                          value={cartItem.employeeId}
                          onChange={(e) =>
                            setItemEmployee(cartItem.id, e.target.value)
                          }
                          className="input-modern text-xs"
                        >
                          {getFilteredEmployeesForItem(cartItem.id).map(
                            (emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                                {emp.employeeRoles.length > 0
                                  ? ` (${emp.employeeRoles
                                      .map((er) => er.role.name)
                                      .join(", ")})`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="font-bold text-lg text-green-600">
                          ${(item.price * cartItem.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modern Cart Summary */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Customer:
                  </label>
                  <button
                    onClick={() => setShowAddCustomer(!showAddCustomer)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                </div>

                {!showAddCustomer ? (
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="input-modern text-sm"
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="input-modern text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone *"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          phone: e.target.value,
                        })
                      }
                      className="input-modern text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          email: e.target.value,
                        })
                      }
                      className="input-modern text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Date of Birth (Optional)"
                      value={newCustomer.dateOfBirth}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="input-modern text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Address (Optional)"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                      className="input-modern text-sm"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={addNewCustomer}
                        className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Add Customer
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCustomer(false);
                          setNewCustomer({
                            name: "",
                            email: "",
                            phone: "",
                            address: "",
                            dateOfBirth: "",
                          });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded text-xs font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modern Checkout Button */}
              <button
                onClick={checkout}
                disabled={cart.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  cart.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Process Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
