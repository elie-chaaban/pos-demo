"use client";

import { useState } from "react";
import { Receipt, Search, Download, Eye, X } from "lucide-react";
import { formatCurrency, formatNumber } from "../../lib/utils";

interface InvoiceData {
  id: string;
  date: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  } | null;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  totalQuantity: number;
  items: Array<{
    id: string;
    itemName: string;
    itemPrice: number;
    quantity: number;
    total: number;
    employeeName: string;
    commissionRate: number;
    commissionAmount: number;
    isService: boolean;
  }>;
  createdAt: string;
}

interface InvoicesTabProps {
  invoicesData: {
    invoices: InvoiceData[];
  } | null;
  selectedPeriod: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const filterAndSortData = (
  data: InvoiceData[],
  searchTerm: string,
  sortBy: string,
  sortOrder: string
) => {
  const filtered = data.filter(
    (invoice) =>
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "total":
        aValue = a.total;
        bValue = b.total;
        break;
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case "customer":
        aValue = a.customer?.name.toLowerCase() || "";
        bValue = b.customer?.name.toLowerCase() || "";
        break;
      default:
        aValue = a.total;
        bValue = b.total;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};

const exportToCSV = (data: InvoiceData[], filename: string) => {
  if (!data || data.length === 0) return;

  const csvData = data.map((invoice) => ({
    id: invoice.id,
    date: invoice.date,
    customer: invoice.customer?.name || "Walk-in",
    email: invoice.customer?.email || "",
    phone: invoice.customer?.phone || "",
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    itemCount: invoice.itemCount,
    totalQuantity: invoice.totalQuantity,
    createdAt: invoice.createdAt,
  }));

  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      headers
        .map((header) => `"${row[header as keyof typeof row] || ""}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function InvoicesTab({
  invoicesData,
  selectedPeriod,
}: InvoicesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("total");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Invoices Report
              </h3>
              <p className="text-gray-600">
                Detailed invoice analysis and transaction history
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="total">Total</option>
              <option value="date">Date</option>
              <option value="customer">Customer</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
            <button
              onClick={() =>
                exportToCSV(
                  invoicesData?.invoices || [],
                  `invoices-${selectedPeriod}`
                )
              }
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {invoicesData?.invoices ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterAndSortData(
                  invoicesData.invoices,
                  searchTerm,
                  sortBy,
                  sortOrder
                ).map((invoice, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer?.name || "Walk-in"}
                      </div>
                      {invoice.customer?.email && (
                        <div className="text-sm text-gray-500">
                          {invoice.customer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(invoice.itemCount)} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No invoices data available for the selected period.
            </p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Invoice Details - {selectedInvoice.id}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedInvoice.date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedInvoice.customer?.name || "Walk-in"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.itemPrice)}
                          {item.isService ? " (Service)" : " (Product)"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Employee: {item.employeeName} ({item.commissionRate}%
                          commission)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.total)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Commission: {formatCurrency(item.commissionAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
