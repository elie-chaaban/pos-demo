"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  CreditCard,
  Users,
  Clock,
  BarChart3,
  ShoppingCart,
  User,
  Tag,
  Download,
  Search,
  Receipt,
  Eye,
  X,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../lib/utils";
import { toast } from "sonner";
import { LowStockData } from "../types";

interface ItemSalesData extends Record<string, unknown> {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  averagePrice: number;
  profitMargin: number;
}

interface CustomerSalesData extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  transactionCount: number;
  averageOrderValue: number;
  lastPurchase: string;
}

interface ExpenseData extends Record<string, unknown> {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  vendor?: string;
}

interface InvoiceData extends Record<string, unknown> {
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
    // Advanced analytics
    hourlyTrends: Record<
      string,
      {
        hour: number;
        sales: number;
        transactions: number;
      }
    >;
    customerAnalytics: {
      totalCustomers: number;
      repeatCustomers: number;
      newCustomers: number;
      averageOrderValue: number;
      topCustomers: Array<{
        id: string;
        name: string;
        totalSpent: number;
        transactionCount: number;
      }>;
    };
    profitMargins: {
      grossProfit: number;
      netProfit: number;
      profitMargin: number;
    };
    transactionMetrics: {
      totalTransactions: number;
      averageTransactionValue: number;
      itemsPerTransaction: number;
    };
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
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [itemSalesData, setItemSalesData] = useState<{
    items: ItemSalesData[];
  } | null>(null);
  const [customerSalesData, setCustomerSalesData] = useState<{
    customers: CustomerSalesData[];
  } | null>(null);
  const [expensesData, setExpensesData] = useState<{
    expenses: ExpenseData[];
  } | null>(null);
  const [invoicesData, setInvoicesData] = useState<{
    invoices: InvoiceData[];
    total: number;
    totalRevenue: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null
  );
  const [lowStockData, setLowStockData] = useState<LowStockData | null>(null);

  const fetchItemSalesData = useCallback(async () => {
    try {
      let url = `/api/reports?period=${selectedPeriod}&type=item-sales`;

      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setItemSalesData(data);
    } catch (error) {
      console.error("Error fetching item sales data:", error);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
  ]);

  const fetchCustomerSalesData = useCallback(async () => {
    try {
      let url = `/api/reports?period=${selectedPeriod}&type=customer-sales`;

      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setCustomerSalesData(data);
    } catch (error) {
      console.error("Error fetching customer sales data:", error);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
  ]);

  const fetchExpensesData = useCallback(async () => {
    try {
      let url = `/api/reports?period=${selectedPeriod}&type=expenses`;

      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setExpensesData(data);
    } catch (error) {
      console.error("Error fetching expenses data:", error);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
  ]);

  const fetchInvoicesData = useCallback(async () => {
    try {
      let url = `/api/invoices?period=${selectedPeriod}`;

      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setInvoicesData(data);
    } catch (error) {
      console.error("Error fetching invoices data:", error);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
  ]);

  const fetchLowStockData = useCallback(async () => {
    try {
      const response = await fetch("/api/reports?type=low-stock");
      const data = await response.json();
      setLowStockData(data);
    } catch (error) {
      console.error("Error fetching low stock data:", error);
    }
  }, []);

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/reports?period=${selectedPeriod}&type=all`;

      if (
        useCustomRange &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        url += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setReportData(data);

      // Fetch detailed data for each tab
      await Promise.all([
        fetchItemSalesData(),
        fetchCustomerSalesData(),
        fetchExpensesData(),
        fetchInvoicesData(),
        fetchLowStockData(),
      ]);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
    fetchItemSalesData,
    fetchCustomerSalesData,
    fetchExpensesData,
    fetchInvoicesData,
    fetchLowStockData,
  ]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
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

  const filterAndSortData = (
    data: Record<string, unknown>[],
    searchTerm: string,
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) => {
    let filtered = data;

    if (searchTerm) {
      filtered = data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
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
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setUseCustomRange(e.target.value === "custom");
              }}
              className="input-modern min-w-[150px]"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {useCustomRange && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="input-modern"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="input-modern"
                  placeholder="End Date"
                />
              </div>
            )}
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {reportData && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "item-sales", name: "Item Sales", icon: ShoppingCart },
                { id: "customer-sales", name: "Customer Sales", icon: User },
                { id: "expenses", name: "Expenses", icon: CreditCard },
                { id: "invoices", name: "Invoices", icon: Receipt },
                {
                  id: "employee-performance",
                  name: "Employee Performance",
                  icon: Users,
                },
                {
                  id: "low-stock",
                  name: "Low Stock Alert",
                  icon: Package,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 cursor-pointer`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

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
          {/* Tab Content */}
          {activeTab === "overview" && (
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
                          Total Employee Commission
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
                          <div
                            key={index}
                            className="modern-card p-6 hover-lift"
                          >
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
                                  {formatNumber(employee.itemsSold)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Advanced Analytics Section */}
              {reportData.revenue && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer Analytics */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Customer Analytics
                        </h3>
                        <p className="text-gray-600">
                          Customer behavior and loyalty insights
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium">
                            Total Customers
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatNumber(
                              reportData.revenue.customerAnalytics
                                .totalCustomers
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 font-medium">
                            Repeat Customers
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {formatNumber(
                              reportData.revenue.customerAnalytics
                                .repeatCustomers
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 font-medium">
                            New Customers
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {formatNumber(
                              reportData.revenue.customerAnalytics.newCustomers
                            )}
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-sm text-orange-600 font-medium">
                            Avg Order Value
                          </div>
                          <div className="text-2xl font-bold text-orange-900">
                            {formatCurrency(
                              reportData.revenue.customerAnalytics
                                .averageOrderValue
                            )}
                          </div>
                        </div>
                      </div>
                      {reportData.revenue.customerAnalytics.topCustomers
                        .length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Top Customers
                          </h4>
                          <div className="space-y-2">
                            {reportData.revenue.customerAnalytics.topCustomers.map(
                              (customer) => (
                                <div
                                  key={customer.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {customer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatNumber(customer.transactionCount)}{" "}
                                      transactions
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-900">
                                      {formatCurrency(customer.totalSpent)}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Metrics */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Transaction Metrics
                        </h3>
                        <p className="text-gray-600">
                          Sales performance and efficiency metrics
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <div className="text-sm text-indigo-600 font-medium">
                            Total Transactions
                          </div>
                          <div className="text-2xl font-bold text-indigo-900">
                            {formatNumber(
                              reportData.revenue.transactionMetrics
                                .totalTransactions
                            )}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 font-medium">
                            Avg Transaction
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {formatCurrency(
                              reportData.revenue.transactionMetrics
                                .averageTransactionValue
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">
                          Items per Transaction
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {formatNumber(
                            reportData.revenue.transactionMetrics
                              .itemsPerTransaction,
                            1
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hourly Trends */}
              {reportData.revenue &&
                Object.keys(reportData.revenue.hourlyTrends).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Hourly Sales Trends
                        </h3>
                        <p className="text-gray-600">
                          Peak hours and sales distribution throughout the day
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.values(reportData.revenue.hourlyTrends)
                        .sort(
                          (
                            a: {
                              hour: number;
                              sales: number;
                              transactions: number;
                            },
                            b: {
                              hour: number;
                              sales: number;
                              transactions: number;
                            }
                          ) => a.hour - b.hour
                        )
                        .map(
                          (
                            trend: {
                              hour: number;
                              sales: number;
                              transactions: number;
                            },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200"
                            >
                              <div className="text-center">
                                <div className="text-sm text-orange-600 font-medium">
                                  {trend.hour}:00
                                </div>
                                <div className="text-xl font-bold text-orange-900">
                                  {formatCurrency(trend.sales)}
                                </div>
                                <div className="text-xs text-orange-500">
                                  {trend.transactions} transactions
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

              {/* Inventory Cost Analysis */}
              {reportData.inventory && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Inventory Cost Analysis
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
                        {formatNumber(reportData.inventory.totalUsage)} units
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
                                  {formatNumber(data.totalQuantity)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatNumber(data.count)}
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
                                    {formatNumber(category.count)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {Object.keys(reportData.expenses.byPaymentMethod).length >
                    0 && (
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
                                  {formatNumber(data.count)}
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

          {/* Item Sales Tab */}
          {activeTab === "item-sales" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Item Sales Report
                      </h3>
                      <p className="text-gray-600">
                        Detailed analysis of individual item performance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search items..."
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
                      <option value="revenue">Revenue</option>
                      <option value="quantity">Quantity</option>
                      <option value="name">Name</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                    <button
                      onClick={() =>
                        exportToCSV(
                          itemSalesData?.items || [],
                          `item-sales-${selectedPeriod}`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {itemSalesData?.items ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity Sold
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Profit Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filterAndSortData(
                          itemSalesData.items,
                          searchTerm,
                          sortBy,
                          sortOrder
                        ).map((item, index: number) => {
                          const typedItem = item as ItemSalesData;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {typedItem.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(typedItem.quantitySold)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(typedItem.revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(typedItem.averagePrice)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(typedItem.profitMargin)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No item sales data available for the selected period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Sales Tab */}
          {activeTab === "customer-sales" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Customer Sales Report
                      </h3>
                      <p className="text-gray-600">
                        Customer behavior and purchase patterns analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customers..."
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
                      <option value="totalSpent">Total Spent</option>
                      <option value="transactionCount">Transactions</option>
                      <option value="name">Name</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                    <button
                      onClick={() =>
                        exportToCSV(
                          customerSalesData?.customers || [],
                          `customer-sales-${selectedPeriod}`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {customerSalesData?.customers ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transactions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Order Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Purchase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filterAndSortData(
                          customerSalesData.customers,
                          searchTerm,
                          sortBy,
                          sortOrder
                        ).map((customer, index: number) => {
                          const typedCustomer = customer as CustomerSalesData;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {typedCustomer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {typedCustomer.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(typedCustomer.totalSpent)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(typedCustomer.transactionCount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(
                                  typedCustomer.averageOrderValue
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(typedCustomer.lastPurchase)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    typedCustomer.transactionCount > 5
                                      ? "bg-green-100 text-green-800"
                                      : typedCustomer.transactionCount > 2
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {typedCustomer.transactionCount > 5
                                    ? "VIP"
                                    : typedCustomer.transactionCount > 2
                                    ? "Regular"
                                    : "New"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No customer sales data available for the selected period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Expenses Report
                      </h3>
                      <p className="text-gray-600">
                        Detailed analysis of business expenses and cost tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search expenses..."
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
                      <option value="amount">Amount</option>
                      <option value="date">Date</option>
                      <option value="description">Description</option>
                      <option value="category">Category</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                    <button
                      onClick={() =>
                        exportToCSV(
                          expensesData?.expenses || [],
                          `expenses-${selectedPeriod}`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Expenses Summary Cards */}
                {reportData.expenses && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-orange-600 font-semibold">
                          Categories
                        </div>
                        <Tag className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-3xl font-bold text-orange-900">
                        {Object.keys(reportData.expenses.byCategory).length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-purple-600 font-semibold">
                          Payment Methods
                        </div>
                        <DollarSign className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {
                          Object.keys(reportData.expenses.byPaymentMethod)
                            .length
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* Expenses by Category */}
                {reportData.expenses &&
                  Object.keys(reportData.expenses.byCategory).length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Expenses by Category
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(reportData.expenses.byCategory).map(
                          (
                            category: {
                              name: string;
                              total: number;
                              count: number;
                            },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {category.count} expenses
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(category.total)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Expenses by Payment Method */}
                {reportData.expenses &&
                  Object.keys(reportData.expenses.byPaymentMethod).length >
                    0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Expenses by Payment Method
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(
                          reportData.expenses.byPaymentMethod
                        ).map(
                          ([method, data]: [
                            string,
                            { total: number; count: number }
                          ]) => (
                            <div
                              key={method}
                              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {method}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {data.count} expenses
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(data.total)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Detailed Expenses Table */}
                {expensesData?.expenses ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filterAndSortData(
                          expensesData.expenses,
                          searchTerm,
                          sortBy,
                          sortOrder
                        ).map((expense, index: number) => {
                          const typedExpense = expense as ExpenseData;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {typedExpense.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {typedExpense.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                {formatCurrency(typedExpense.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typedExpense.paymentMethod}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(typedExpense.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typedExpense.vendor || "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No expenses data available for the selected period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Invoices List
                      </h3>
                      <p className="text-gray-600">
                        Complete list of all invoices with detailed item
                        breakdown
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
                      <option value="total">Total Amount</option>
                      <option value="date">Date</option>
                      <option value="itemCount">Item Count</option>
                      <option value="customer">Customer</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
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

                {/* Invoices Summary Cards */}
                {invoicesData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-indigo-600 font-semibold">
                          Total Invoices
                        </div>
                        <Receipt className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="text-3xl font-bold text-indigo-900">
                        {formatNumber(invoicesData.total)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-green-600 font-semibold">
                          Total Revenue
                        </div>
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-green-900">
                        {formatCurrency(invoicesData.totalRevenue)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-purple-600 font-semibold">
                          Avg Invoice Value
                        </div>
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(
                          invoicesData.total > 0
                            ? invoicesData.totalRevenue / invoicesData.total
                            : 0
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoices Table */}
                {invoicesData?.invoices ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
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
                        ).map((invoice, index: number) => {
                          const typedInvoice = invoice as InvoiceData;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  #{typedInvoice.id.slice(-8)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatNumber(typedInvoice.totalQuantity)}{" "}
                                  items
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {typedInvoice.customer?.name ||
                                    "Walk-in Customer"}
                                </div>
                                {typedInvoice.customer?.phone && (
                                  <div className="text-sm text-gray-500">
                                    {typedInvoice.customer.phone}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(typedInvoice.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatNumber(typedInvoice.itemCount)} items
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatNumber(typedInvoice.totalQuantity)}{" "}
                                  total qty
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(typedInvoice.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    setSelectedInvoice(typedInvoice)
                                  }
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No invoices found for the selected period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee Performance Tab */}
          {activeTab === "employee-performance" && (
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
                        Individual employee sales performance and commission
                        tracking
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
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                    <button
                      onClick={() =>
                        exportToCSV(
                          Object.values(reportData.revenue?.byEmployee || {}),
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

                {reportData.revenue?.byEmployee &&
                Object.keys(reportData.revenue.byEmployee).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Sales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Commission
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items Sold
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Sale Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filterAndSortData(
                          Object.values(reportData.revenue.byEmployee),
                          searchTerm,
                          sortBy,
                          sortOrder
                        ).map((employee, index: number) => {
                          const typedEmployee = employee as {
                            name: string;
                            totalSales: number;
                            commission: number;
                            itemsSold: number;
                          };
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">
                                      {typedEmployee.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {typedEmployee.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(typedEmployee.totalSales)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {formatCurrency(typedEmployee.commission)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(typedEmployee.itemsSold)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(
                                  typedEmployee.totalSales /
                                    Math.max(typedEmployee.itemsSold, 1)
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No employee performance data available for the selected
                      period.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low Stock Alert Tab */}
          {activeTab === "low-stock" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Low Stock Alert Report
                      </h3>
                      <p className="text-gray-600">
                        Items below reorder threshold requiring immediate
                        attention
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        exportToCSV(
                          (lowStockData?.items || []) as unknown as Record<
                            string,
                            unknown
                          >[],
                          `low-stock-alert-${
                            new Date().toISOString().split("T")[0]
                          }`
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {lowStockData && lowStockData.items.length > 0 ? (
                  <>
                    {/* Alert Summary */}
                    <div
                      className="mb-6 p-4 rounded-lg border-l-4 bg-gray-50"
                      style={{
                        borderLeftColor: lowStockData.alerts.urgent
                          ? "#ef4444"
                          : "#f59e0b",
                      }}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            lowStockData.alerts.urgent
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <p
                          className={`font-semibold ${
                            lowStockData.alerts.urgent
                              ? "text-red-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {lowStockData.alerts.message}
                        </p>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-100 text-sm font-medium">
                              Out of Stock
                            </p>
                            <p className="text-3xl font-bold">
                              {lowStockData.summary.outOfStockItems}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-100 text-sm font-medium">
                              Low Stock
                            </p>
                            <p className="text-3xl font-bold">
                              {lowStockData.summary.warningStockItems}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">
                              Value at Risk
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(
                                lowStockData.summary.totalValueAtRisk
                              )}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">
                              Potential Lost Sales
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(
                                lowStockData.summary.potentialLostSales
                              )}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Low Stock Items Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reorder Threshold
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Suggested Reorder
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Days Until Out
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {lowStockData.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-sm">
                                      {item.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatCurrency(item.price)} each
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.currentStock === 0
                                      ? "bg-red-100 text-red-800"
                                      : item.currentStock <=
                                        item.reorderThreshold * 0.5
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {item.currentStock}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.reorderThreshold}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.status === "Out of Stock"
                                      ? "bg-red-100 text-red-800"
                                      : item.status === "Critical"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.stockValue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.suggestedReorderQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.daysUntilOutOfStock > 0
                                  ? `${item.daysUntilOutOfStock} days`
                                  : "Out of stock"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      All items are adequately stocked! No low stock alerts at
                      this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
            Click &quot;Generate Report&quot; to view comprehensive revenue
            sharing analytics
          </p>
          <button
            onClick={generateReport}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
          >
            Generate Your First Report
          </button>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Invoice Details</h2>
                    <p className="text-indigo-100 text-sm">
                      Invoice #{selectedInvoice.id.slice(-8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedInvoice.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedInvoice.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {selectedInvoice.customer && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-900">
                          {selectedInvoice.customer.name}
                        </p>
                        {selectedInvoice.customer.phone && (
                          <p className="text-sm text-gray-600">
                            {selectedInvoice.customer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Invoice Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">
                        {formatNumber(selectedInvoice.itemCount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-medium">
                        {formatNumber(selectedInvoice.totalQuantity)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-green-600">
                          {formatCurrency(selectedInvoice.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Items
                </h3>
                <div className="space-y-3">
                  {selectedInvoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.itemName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.itemPrice)} each
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span>Employee: {item.employeeName}</span>
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
                            {formatCurrency(item.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Commission: {formatCurrency(item.commissionAmount)}{" "}
                            ({item.commissionRate}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    Invoice generated on {formatDate(selectedInvoice.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Export single invoice
                      const invoiceData = [
                        {
                          "Invoice ID": selectedInvoice.id,
                          Date: formatDate(selectedInvoice.date),
                          Customer:
                            selectedInvoice.customer?.name ||
                            "Walk-in Customer",
                          "Total Items": selectedInvoice.itemCount,
                          "Total Quantity": selectedInvoice.totalQuantity,
                          "Total Amount": selectedInvoice.total,
                          Items: selectedInvoice.items
                            .map(
                              (item) =>
                                `${item.itemName} (${
                                  item.quantity
                                }x ${formatCurrency(item.itemPrice)})`
                            )
                            .join("; "),
                        },
                      ];
                      exportToCSV(
                        invoiceData,
                        `invoice-${selectedInvoice.id.slice(-8)}`
                      );
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
