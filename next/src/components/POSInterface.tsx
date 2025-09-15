"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  CreditCard,
  Plus,
  Minus,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { toast } from "sonner";
import LoadingButton from "./LoadingButton";
import InvoicePopup from "./InvoicePopup";
import {
  Item,
  EmployeeWithCommission,
  Customer,
  CartItem,
  CustomerFormData,
} from "../types";

export default function POSInterface() {
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });
  const [itemEmployees, setItemEmployees] = useState<
    Record<string, EmployeeWithCommission[]>
  >({});
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, customersRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/customers"),
      ]);

      const [itemsData, customersData] = await Promise.all([
        itemsRes.json(),
        customersRes.json(),
      ]);

      // Ensure we always set arrays, even if API returns errors
      const itemsArray = Array.isArray(itemsData) ? itemsData : [];
      const customersArray = Array.isArray(customersData) ? customersData : [];

      setItems(itemsArray);
      setCustomers(customersArray);

      // Fetch employees for each item
      const itemEmployeesMap: Record<string, EmployeeWithCommission[]> = {};
      for (const item of itemsArray) {
        try {
          const response = await fetch(`/api/items/${item.id}/employees`);
          if (response.ok) {
            const assignedEmployees = await response.json();
            itemEmployeesMap[item.id] = assignedEmployees;
          } else {
            itemEmployeesMap[item.id] = [];
          }
        } catch (error) {
          console.error(`Error fetching employees for item ${item.id}:`, error);
          itemEmployeesMap[item.id] = [];
        }
      }
      setItemEmployees(itemEmployeesMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays on error to prevent filter issues
      setItems([]);
      setCustomers([]);
      setItemEmployees({});
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
      toast.error("Item out of stock!");
      return;
    }

    const existingItem = cart.find((cartItem) => cartItem.id === itemId);
    if (existingItem) {
      if (!item.isService && existingItem.quantity >= item.stock) {
        toast.error("Not enough stock available!");
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
      // Get employees assigned to this specific item
      const assignedEmployees = itemEmployees[itemId] || [];
      const defaultEmployee = assignedEmployees[0];

      // Check if we have a valid employee assigned to this item
      if (!defaultEmployee) {
        toast.error(
          `No employee assigned to "${item.name}". Please assign an employee to this item first.`
        );
        return;
      }

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
      toast.error("Not enough stock available!");
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

  // Function to get employees assigned to a specific item
  const getAssignedEmployeesForItem = (
    itemId: string
  ): EmployeeWithCommission[] => {
    return itemEmployees[itemId] || [];
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer("");
  };

  const addNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Please fill in name and phone fields");
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
        toast.success("Customer added successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Error creating customer. Please try again.");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => {
      const item = items.find((i) => i.id === cartItem.id);
      return sum + (item ? item.price * cartItem.quantity : 0);
    }, 0);
  };

  const checkout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // Check if all cart items have valid employee assignments
    const itemsWithoutEmployee = cart.filter((item) => !item.employeeId);
    if (itemsWithoutEmployee.length > 0) {
      toast.error(
        "Some items don't have an employee assigned. Please assign employees to all items."
      );
      return;
    }

    // Show the invoice popup instead of immediately processing
    setShowInvoicePopup(true);
  };

  const processPayment = async () => {
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
        toast.success("Sale completed successfully!");
        clearCart();
        fetchData(); // Refresh data to update stock
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Error during checkout. Please try again.");
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
    <div className="h-full flex flex-col p-3 sm:p-4 lg:p-6">
      {/* Compact Stats Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">
                  {formatNumber(items.length)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Items</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(cart.length)}
                </div>
                <div className="text-xs text-gray-500 font-medium">In Cart</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(total)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Modern Items Grid */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
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
                {formatNumber(filteredItems.length)} of{" "}
                {formatNumber(items.length)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
              {filteredItems.map((item) => {
                const isLowStock = !item.isService && item.stock <= 5;
                const isOutOfStock = !item.isService && item.stock === 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item.id)}
                    className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:border-indigo-300 ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
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
                      {formatCurrency(item.price)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.isService
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.isService
                          ? "Service"
                          : `Stock: ${formatNumber(item.stock)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modern Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden order-first xl:order-last">
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
                  {formatNumber(cart.length)} items
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
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
                          {getAssignedEmployeesForItem(cartItem.id).map(
                            (emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name} ({emp.commissionRate}% commission)
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(item.price * cartItem.quantity)}
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
                  <span className="text-green-600">
                    {formatCurrency(total)}
                  </span>
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
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
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
                      <LoadingButton
                        onClick={addNewCustomer}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        Add Customer
                      </LoadingButton>
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
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded text-xs font-semibold hover:bg-gray-400 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modern Checkout Button */}
              <LoadingButton
                onClick={checkout}
                disabled={cart.length === 0}
                variant="success"
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                icon={<CreditCard className="w-4 h-4" />}
              >
                Process Payment
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Popup */}
      <InvoicePopup
        isOpen={showInvoicePopup}
        onClose={() => setShowInvoicePopup(false)}
        onConfirm={processPayment}
        cart={cart}
        items={items}
        customers={customers}
        selectedCustomer={selectedCustomer}
        total={total}
      />
    </div>
  );
}
