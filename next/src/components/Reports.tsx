"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Package,
  CreditCard,
  Users,
  BarChart3,
  ShoppingCart,
  User,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { LowStockData } from "../types";
import OverviewTab from "./reports/OverviewTab";
import ItemSalesTab from "./reports/ItemSalesTab";
import CustomerSalesTab from "./reports/CustomerSalesTab";
import ExpensesTab from "./reports/ExpensesTab";
import InvoicesTab from "./reports/InvoicesTab";
import EmployeePerformanceTab from "./reports/EmployeePerformanceTab";
import LowStockTab from "./reports/LowStockTab";

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
    transactionMetrics: {
      totalTransactions: number;
      averageTransactionValue: number;
      itemsPerTransaction: number;
    };
    hourlyTrends: Record<
      string,
      {
        hour: number;
        sales: number;
        transactions: number;
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
  const [useCustomRange] = useState(false);
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
  } | null>(null);
  const [employeePerformanceData, setEmployeePerformanceData] = useState<{
    employees: Array<{
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
    }>;
  } | null>(null);
  const [lowStockData, setLowStockData] = useState<LowStockData | null>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/reports?period=${selectedPeriod}`;

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

      // Fetch additional data for each tab
      const [
        itemSalesRes,
        customerSalesRes,
        expensesRes,
        invoicesRes,
        employeePerfRes,
        lowStockRes,
      ] = await Promise.all([
        fetch(`${url}&type=item-sales`),
        fetch(`${url}&type=customer-sales`),
        fetch(`${url}&type=expenses`),
        fetch(`${url}&type=invoices`),
        fetch(`${url}&type=employee-performance`),
        fetch(`${url}&type=low-stock`),
      ]);

      const [
        itemSales,
        customerSales,
        expenses,
        invoices,
        employeePerf,
        lowStock,
      ] = await Promise.all([
        itemSalesRes.json(),
        customerSalesRes.json(),
        expensesRes.json(),
        invoicesRes.json(),
        employeePerfRes.json(),
        lowStockRes.json(),
      ]);

      setItemSalesData(itemSales);
      setCustomerSalesData(customerSales);
      setExpensesData(expenses);
      setInvoicesData(invoices);
      setEmployeePerformanceData(employeePerf);
      setLowStockData(lowStock);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Error loading reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    useCustomRange,
    customDateRange.startDate,
    customDateRange.endDate,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive business analytics and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {selectedPeriod === "custom" && (
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
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
            <OverviewTab
              reportData={reportData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "item-sales" && (
            <ItemSalesTab
              itemSalesData={itemSalesData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "customer-sales" && (
            <CustomerSalesTab
              customerSalesData={customerSalesData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "expenses" && (
            <ExpensesTab
              expensesData={expensesData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesTab
              invoicesData={invoicesData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "employee-performance" && (
            <EmployeePerformanceTab
              employeePerformanceData={employeePerformanceData}
              selectedPeriod={selectedPeriod}
            />
          )}

          {activeTab === "low-stock" && (
            <LowStockTab
              lowStockData={lowStockData}
              selectedPeriod={selectedPeriod}
            />
          )}
        </div>
      )}
    </div>
  );
}
