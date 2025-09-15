"use client";

import { useState } from "react";
import {
  Crown,
  Search,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../lib/utils";

interface CustomerLifetimeValueData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalLifetimeValue: number;
  totalTransactions: number;
  averageOrderValue: number;
  firstPurchase: string | null;
  lastPurchase: string | null;
  daysSinceLastPurchase: number;
  purchaseFrequency: number;
  customerLifespan: number;
  clvTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  recentActivity: number;
  recentTransactions: number;
}

interface CustomerLifetimeValueTabProps {
  clvData: {
    customers: CustomerLifetimeValueData[];
    summary: {
      totalCustomers: number;
      totalLifetimeValue: number;
      averageLifetimeValue: number;
      tierDistribution: {
        Platinum: number;
        Gold: number;
        Silver: number;
        Bronze: number;
      };
      topRecentCustomers: CustomerLifetimeValueData[];
      periodStart: string;
      periodEnd: string;
    };
  } | null;
  selectedPeriod: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Platinum":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Gold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Silver":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Bronze":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Platinum":
      return "💎";
    case "Gold":
      return "🥇";
    case "Silver":
      return "🥈";
    case "Bronze":
      return "🥉";
    default:
      return "👤";
  }
};

const filterAndSortData = (
  data: CustomerLifetimeValueData[],
  searchTerm: string,
  sortBy: string,
  sortOrder: string,
  tierFilter: string
) => {
  const filtered = data.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = tierFilter === "all" || customer.clvTier === tierFilter;

    return matchesSearch && matchesTier;
  });

  filtered.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "totalLifetimeValue":
        aValue = a.totalLifetimeValue;
        bValue = b.totalLifetimeValue;
        break;
      case "totalTransactions":
        aValue = a.totalTransactions;
        bValue = b.totalTransactions;
        break;
      case "averageOrderValue":
        aValue = a.averageOrderValue;
        bValue = b.averageOrderValue;
        break;
      case "purchaseFrequency":
        aValue = a.purchaseFrequency;
        bValue = b.purchaseFrequency;
        break;
      case "daysSinceLastPurchase":
        aValue = a.daysSinceLastPurchase;
        bValue = b.daysSinceLastPurchase;
        break;
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        aValue = a.totalLifetimeValue;
        bValue = b.totalLifetimeValue;
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};

const exportToCSV = (data: CustomerLifetimeValueData[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Total Lifetime Value",
    "Total Transactions",
    "Average Order Value",
    "First Purchase",
    "Last Purchase",
    "Days Since Last Purchase",
    "Purchase Frequency",
    "Customer Lifespan (Days)",
    "CLV Tier",
    "Recent Activity",
    "Recent Transactions",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      [
        `"${row.name}"`,
        `"${row.email}"`,
        `"${row.phone}"`,
        row.totalLifetimeValue,
        row.totalTransactions,
        row.averageOrderValue,
        `"${formatDate(row.firstPurchase)}"`,
        `"${formatDate(row.lastPurchase)}"`,
        row.daysSinceLastPurchase,
        Math.round(row.purchaseFrequency),
        row.customerLifespan,
        `"${row.clvTier}"`,
        row.recentActivity,
        row.recentTransactions,
      ].join(",")
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

export default function CustomerLifetimeValueTab({
  clvData,
  selectedPeriod,
}: CustomerLifetimeValueTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalLifetimeValue");
  const [sortOrder, setSortOrder] = useState("desc");
  const [tierFilter, setTierFilter] = useState("all");

  if (!clvData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center py-12">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No customer lifetime value data available for the selected period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { customers, summary } = clvData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total CLV</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalLifetimeValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.totalCustomers)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average CLV</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.averageLifetimeValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Platinum Customers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.tierDistribution.Platinum}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Tier Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary.tierDistribution).map(([tier, count]) => (
            <div key={tier} className="text-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(
                  tier
                )}`}
              >
                <span className="mr-2">{getTierIcon(tier)}</span>
                {tier}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-sm text-gray-600">
                {summary.totalCustomers > 0
                  ? Math.round((count / summary.totalCustomers) * 100)
                  : 0}
                %
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Customer Lifetime Value Report
              </h3>
              <p className="text-gray-600">
                Comprehensive customer value analysis and segmentation
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
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="totalLifetimeValue">Lifetime Value</option>
              <option value="totalTransactions">Transactions</option>
              <option value="averageOrderValue">Avg Order Value</option>
              <option value="purchaseFrequency">Purchase Frequency</option>
              <option value="daysSinceLastPurchase">
                Days Since Last Purchase
              </option>
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
                  filterAndSortData(
                    customers,
                    searchTerm,
                    sortBy,
                    sortOrder,
                    tierFilter
                  ),
                  `customer-lifetime-value-${selectedPeriod}`
                )
              }
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CLV Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lifetime Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Purchase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterAndSortData(
                customers,
                searchTerm,
                sortBy,
                sortOrder,
                tierFilter
              ).map((customer, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(
                        customer.clvTier
                      )}`}
                    >
                      <span className="mr-1">
                        {getTierIcon(customer.clvTier)}
                      </span>
                      {customer.clvTier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(customer.totalLifetimeValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(customer.totalTransactions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.averageOrderValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(customer.purchaseFrequency)}/month
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(customer.lastPurchase)}</div>
                    <div className="text-xs text-gray-500">
                      {customer.daysSinceLastPurchase} days ago
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium text-blue-600">
                      {formatCurrency(customer.recentActivity)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.recentTransactions} transactions
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
