"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Receipt,
  TrendingUp,
  DollarSign,
  Package,
  CreditCard,
} from "lucide-react";

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  revenue?: {
    totalSales: number;
    totalTax: number;
    totalRevenue: number;
    employeeEarnings: number;
    salonOwnerEarnings: number;
    byEmployee: Record<
      string,
      {
        name: string;
        totalSales: number;
        commission: number;
        itemsSold: number;
      }
    >;
    byCategory: Record<
      string,
      {
        name: string;
        totalSales: number;
        employeeCommission: number;
        salonOwnerShare: number;
      }
    >;
  };
  expenses?: {
    totalExpenses: number;
    byCategory: Record<
      string,
      {
        name: string;
        total: number;
        count: number;
      }
    >;
    byPaymentMethod: Record<
      string,
      {
        total: number;
        count: number;
      }
    >;
  };
  inventory?: {
    totalCost: number;
    totalUsage: number;
    byItem: Record<
      string,
      {
        name: string;
        category: string;
        totalCost: number;
        totalQuantity: number;
      }
    >;
    byType: Record<
      string,
      {
        totalCost: number;
        totalQuantity: number;
        count: number;
      }
    >;
  };
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  useEffect(() => {
    generateReport();
  }, [selectedPeriod]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports?period=${selectedPeriod}&type=all`
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const testInvoice = () => {
    // This would generate a test invoice - placeholder for now
    alert("Test invoice functionality would be implemented here");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-full space-y-8">
      {/* Modern Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Revenue Sharing Reports
            </h1>
            <p className="text-gray-600">
              Comprehensive business analytics and revenue distribution
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-modern min-w-[150px]"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Generate Report</span>
            </button>
            <button
              onClick={testInvoice}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Receipt className="w-5 h-5" />
              <span>Test Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold text-gray-700 mb-2">
              Generating Reports
            </div>
            <div className="text-gray-500">
              Analyzing data and calculating revenue sharing...
            </div>
          </div>
        </div>
      )}

      {reportData && !loading && (
        <div className="space-y-8">
          {/* Modern Revenue Sharing Dashboard */}
          {reportData.revenue && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedPeriod === "today"
                      ? "Today's"
                      : `This ${
                          selectedPeriod.charAt(0).toUpperCase() +
                          selectedPeriod.slice(1)
                        }'s`}{" "}
                    Revenue Sharing
                  </h3>
                  <p className="text-gray-600">
                    Financial performance overview
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-blue-600 font-semibold">
                      Total Sales
                    </div>
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatCurrency(reportData.revenue.totalSales)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-green-600 font-semibold">
                      Employee Earnings
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {formatCurrency(reportData.revenue.employeeEarnings)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-purple-600 font-semibold">
                      Salon Owner Share
                    </div>
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900">
                    {formatCurrency(reportData.revenue.salonOwnerEarnings)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 font-semibold">
                      Total Revenue
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(reportData.revenue.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modern Employee Performance Cards */}
          {reportData.revenue &&
            Object.keys(reportData.revenue.byEmployee).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Employee Performance
                    </h3>
                    <p className="text-gray-600">
                      Individual sales and commission tracking
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(reportData.revenue.byEmployee).map(
                    (employee, index) => (
                      <div key={index} className="modern-card p-6 hover-lift">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(employee.commission)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Commission
                            </div>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                          {employee.name}
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">
                              Total Sales:
                            </span>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(employee.totalSales)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">
                              Items Sold:
                            </span>
                            <span className="font-bold text-indigo-600">
                              {employee.itemsSold}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Modern Cost Analysis & Profitability */}
          {reportData.revenue && reportData.expenses && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Cost Analysis & Profitability
                  </h3>
                  <p className="text-gray-600">
                    Financial performance breakdown
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-green-600 font-semibold">
                      Gross Revenue
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {formatCurrency(reportData.revenue.totalSales)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-red-600 font-semibold">
                      Total Expenses
                    </div>
                    <CreditCard className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-red-900">
                    {formatCurrency(reportData.expenses.totalExpenses)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-blue-600 font-semibold">
                      Net Profit
                    </div>
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatCurrency(
                      reportData.revenue.totalSales -
                        reportData.expenses.totalExpenses
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Batch Tracking */}
          {reportData.inventory && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Inventory Batch Tracking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">
                    Total Cost
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(reportData.inventory.totalCost)}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">
                    Total Usage
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {reportData.inventory.totalUsage} units
                  </div>
                </div>
              </div>

              {Object.keys(reportData.inventory.byType).length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(reportData.inventory.byType).map(
                        ([type, data]) => (
                          <tr key={type} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(data.totalCost)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.totalQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.count}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Expenses Breakdown */}
          {reportData.expenses && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Expenses Breakdown
              </h3>

              {Object.keys(reportData.expenses.byCategory).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">By Category</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(reportData.expenses.byCategory).map(
                          (category, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {category.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(category.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {category.count}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {Object.keys(reportData.expenses.byPaymentMethod).length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-3">
                    By Payment Method
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(
                          reportData.expenses.byPaymentMethod
                        ).map(([method, data]) => (
                          <tr key={method} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(data.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modern Report Period Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-600 font-medium mb-1">
                  Report Period
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(reportData.startDate)} -{" "}
                  {formatDate(reportData.endDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Report Data Available
          </h3>
          <p className="text-gray-500 mb-6">
            Click "Generate Report" to view comprehensive revenue sharing
            analytics
          </p>
          <button
            onClick={generateReport}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Generate Your First Report
          </button>
        </div>
      )}
    </div>
  );
}
