"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Users,
  UserStar,
  Package,
  Warehouse,
  Receipt,
  Tags,
  BarChart3,
  Settings2,
  Shield,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import POSInterface from "@/components/POSInterface";
import CustomerManagement from "@/components/CustomerManagement";
import EmployeeManagement from "@/components/EmployeeManagement";
import ItemManagement from "@/components/ItemManagement";
import InventoryManagement from "@/components/InventoryManagement";
import ExpenseManagement from "@/components/ExpenseManagement";
import CategoryManagement from "@/components/CategoryManagement";
import UserRoleManagement from "@/components/UserRoleManagement";
import Reports from "@/components/Reports";
import Settings from "@/components/Settings";
import AuthWrapper from "@/components/AuthWrapper";
import { useAuth } from "@/contexts/AuthContext";

type Section =
  | "pos"
  | "customers"
  | "employees"
  | "items"
  | "inventory"
  | "expenses"
  | "categories"
  | "user-roles"
  | "reports"
  | "settings";

const navigation = [
  { id: "pos", name: "POS", icon: ShoppingCart },
  { id: "customers", name: "Customers", icon: Users },
  { id: "employees", name: "Employees", icon: UserStar },
  { id: "items", name: "Items", icon: Package },
  { id: "inventory", name: "Inventory", icon: Warehouse },
  { id: "expenses", name: "Expenses", icon: Receipt },
  { id: "categories", name: "Categories", icon: Tags },
  { id: "user-roles", name: "User Roles", icon: Shield },
  { id: "reports", name: "Reports", icon: BarChart3 },
  { id: "settings", name: "Settings", icon: Settings2 },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("pos");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "pos":
        return <POSInterface />;
      case "customers":
        return <CustomerManagement />;
      case "employees":
        return <EmployeeManagement />;
      case "items":
        return <ItemManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "expenses":
        return <ExpenseManagement />;
      case "categories":
        return <CategoryManagement />;
      case "user-roles":
        return <UserRoleManagement />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <POSInterface />;
    }
  };

  return (
    <AuthWrapper>
      {/* If POS is active, show fullscreen POS interface */}
      {activeSection === "pos" ? (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
          {/* Minimal Header for POS */}
          <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      SalonPOS
                    </h1>
                    <p className="text-xs text-gray-600">Point of Sale</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.username || "User"}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Fullscreen POS Interface */}
          <div className="h-[calc(100vh-73px)]">
            <POSInterface />
          </div>

          {/* Collapsible Sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">
                          SalonPOS
                        </h1>
                        <p className="text-sm text-gray-600">Management</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <nav className="p-6 space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id as Section);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-semibold">{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* For other sections, show the full dashboard layout */
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Modern Sidebar */}
          <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl hidden lg:block">
            {/* Logo Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">SalonPOS</h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Professional Management
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as Section)}
                    className={`w-full flex items-center px-5 py-4 text-left rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
                    )}
                    <Icon
                      className={`w-5 h-5 mr-4 transition-all duration-300 relative z-10 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    <span
                      className={`font-semibold relative z-10 ${
                        isActive ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="status-online"></div>
                  <span className="text-sm font-medium text-gray-600">
                    System Online
                  </span>
                </div>
                <p className="text-xs text-gray-500">Version 2.0.0</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Modern Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-4 lg:py-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 capitalize">
                        {navigation.find((nav) => nav.id === activeSection)
                          ?.name || "Dashboard"}
                      </h2>
                      <p className="text-gray-600 mt-1 lg:mt-2 font-medium text-sm lg:text-base">
                        {activeSection === "customers" &&
                          "Manage customer information and build relationships"}
                        {activeSection === "employees" &&
                          "Manage staff and employee details"}
                        {activeSection === "items" &&
                          "Manage products and services catalog"}
                        {activeSection === "inventory" &&
                          "Track stock levels and inventory management"}
                        {activeSection === "expenses" &&
                          "Record and manage business expenses"}
                        {activeSection === "categories" &&
                          "Organize items into categories"}
                        {activeSection === "user-roles" &&
                          "Manage employee roles and permissions"}
                        {activeSection === "reports" &&
                          "View business analytics and insights"}
                        {activeSection === "settings" &&
                          "Configure system settings and preferences"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-semibold text-gray-900">
                        {user?.username || "User"}
                      </div>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs lg:text-sm">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="p-4 lg:p-8">
                <div className="animate-in">{renderSection()}</div>
              </div>
            </main>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
              ></div>
              <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">
                          SalonPOS
                        </h1>
                        <p className="text-sm text-gray-600">Management</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <nav className="p-6 space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id as Section);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-semibold">{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}
        </div>
      )}
    </AuthWrapper>
  );
}
