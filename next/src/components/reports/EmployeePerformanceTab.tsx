"use client";

import { useState } from "react";
import { Users, Search, Download } from "lucide-react";
import { formatCurrency, formatNumber } from "../../lib/utils";

interface EmployeePerformanceData {
  id: string;
  name: string;
  totalSales: number;
  commission: number;
  itemsSold: number;
  transactionCount: number;
  averageTransactionValue: number;
  topItems: Array<{
    itemName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

interface EmployeePerformanceTabProps {
  employeePerformanceData: {
    employees: EmployeePerformanceData[];
  } | null;
  selectedPeriod: string;
}

const filterAndSortData = (
  data: EmployeePerformanceData[],
  searchTerm: string,
  sortBy: string,
  sortOrder: string
) => {
  const filtered = data.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "totalSales":
        aValue = a.totalSales;
        bValue = b.totalSales;
        break;
      case "commission":
        aValue = a.commission;
        bValue = b.commission;
        break;
      case "itemsSold":
        aValue = a.itemsSold;
        bValue = b.itemsSold;
        break;
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        aValue = a.totalSales;
        bValue = b.totalSales;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};

const exportToCSV = (data: EmployeePerformanceData[], filename: string) => {
  if (!data || data.length === 0) return;

  const csvData = data.map((employee) => ({
    name: employee.name,
    totalSales: employee.totalSales,
    commission: employee.commission,
    itemsSold: employee.itemsSold,
    transactionCount: employee.transactionCount,
    averageTransactionValue: employee.averageTransactionValue,
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

export default function EmployeePerformanceTab({
  employeePerformanceData,
  selectedPeriod,
}: EmployeePerformanceTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalSales");
  const [sortOrder, setSortOrder] = useState("desc");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Employee Performance Report
              </h3>
              <p className="text-gray-600">
                Individual employee sales and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
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
              <option value="totalSales">Total Sales</option>
              <option value="commission">Commission</option>
              <option value="itemsSold">Items Sold</option>
              <option value="name">Name</option>
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
                  employeePerformanceData?.employees || [],
                  `employee-performance-${selectedPeriod}`
                )
              }
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {employeePerformanceData?.employees ? (
          <div className="space-y-6">
            {filterAndSortData(
              employeePerformanceData.employees,
              searchTerm,
              sortBy,
              sortOrder
            ).map((employee, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {employee.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Employee ID: {employee.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(employee.commission)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total Commission
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      Total Sales
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(employee.totalSales)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      Items Sold
                    </div>
                    <div className="text-xl font-bold text-indigo-600">
                      {formatNumber(employee.itemsSold)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      Transactions
                    </div>
                    <div className="text-xl font-bold text-purple-600">
                      {formatNumber(employee.transactionCount)}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      Avg Transaction
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(employee.averageTransactionValue)}
                    </div>
                  </div>
                </div>

                {employee.topItems.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">
                      Top Performing Items
                    </h5>
                    <div className="space-y-2">
                      {employee.topItems.slice(0, 3).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex justify-between items-center p-3 bg-white rounded"
                        >
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(item.quantitySold)} sold
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No employee performance data available for the selected period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
