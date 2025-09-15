"use client";

import { X, CreditCard, User, Calendar, Receipt } from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { CartItem, Item, Customer } from "../types";

interface InvoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cart: CartItem[];
  items: Item[];
  customers: Customer[];
  selectedCustomer: string;
  total: number;
}

export default function InvoicePopup({
  isOpen,
  onClose,
  onConfirm,
  cart,
  items,
  customers,
  selectedCustomer,
  total,
}: InvoicePopupProps) {
  if (!isOpen) return null;

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Invoice Summary</h2>
                <p className="text-green-100 text-sm">
                  Review your order before payment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900">{currentDate}</p>
                  <p className="text-sm text-gray-600">{currentTime}</p>
                </div>
              </div>

              {selectedCustomerData && (
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCustomerData.name}
                    </p>
                    {selectedCustomerData.phone && (
                      <p className="text-sm text-gray-600">
                        {selectedCustomerData.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">
                    {formatNumber(cart.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">
                    {formatNumber(
                      cart.reduce((sum, item) => sum + item.quantity, 0)
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-green-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="space-y-3">
              {cart.map((cartItem) => {
                const item = items.find((i) => i.id === cartItem.id);
                if (!item) return null;

                return (
                  <div
                    key={cartItem.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} each
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Qty: {cartItem.quantity}</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              item.isService
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.isService ? "Service" : "Product"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(item.price * cartItem.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Ready to process payment?</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
