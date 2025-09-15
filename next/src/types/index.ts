// Centralized type definitions for the POS system

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  employeeServices?: EmployeeService[];
}

// Extended Employee type for POS interface with commission rate
export interface EmployeeWithCommission extends Employee {
  commissionRate: number;
}

export interface EmployeeService {
  id: string;
  employeeId: string;
  itemId: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employee: Employee;
  item: Item;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  isService: boolean;
  description?: string;
  averageCost?: number;
  reorderThreshold?: number;
  createdAt: string;
  updatedAt: string;
  employeeServices?: EmployeeService[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  sales: Sale[];
}

export interface Sale {
  id: string;
  customerId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  itemId: string;
  employeeId: string;
  quantity: number;
  price: number;
  total: number;
  commissionAmount: number;
  salonOwnerAmount: number;
  createdAt: string;
  updatedAt: string;
  sale: Sale;
  item: Item;
  employee: Employee;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  expenses: Expense[];
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: ExpenseCategory;
}

// Form data types
export interface EmployeeFormData {
  name: string;
  email?: string;
  phone?: string;
}

export interface ServiceFormData {
  itemId: string;
  commissionRate: number;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

export interface ItemFormData {
  name: string;
  price: number;
  stock: number;
  isService: boolean;
  description: string;
  reorderThreshold?: number;
}

export interface ExpenseCategoryFormData {
  name: string;
  description: string;
}

export interface ExpenseFormData {
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

// Cart and POS types
export interface CartItem {
  id: string;
  quantity: number;
  employeeId: string;
}

// Report types

export interface EmployeeSalesData {
  employeeName: string;
  totalSales: number;
  totalCommission: number;
  totalQuantity: number;
  itemCount: number;
}

export interface DailySalesData {
  date: string;
  totalSales: number;
  totalQuantity: number;
  transactionCount: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Component prop types
export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
}

export interface LoadingButtonProps {
  onClick: () => Promise<void> | void;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

// Low Stock Alert types
export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  reorderThreshold: number;
  price: number;
  averageCost: number;
  stockValue: number;
  status: "Out of Stock" | "Critical" | "Low";
  daysUntilOutOfStock: number;
  suggestedReorderQuantity: number;
  lastUpdated: string;
}

export interface LowStockData {
  items: LowStockItem[];
  summary: {
    totalLowStockItems: number;
    outOfStockItems: number;
    criticalStockItems: number;
    warningStockItems: number;
    totalValueAtRisk: number;
    potentialLostSales: number;
    averageStockLevel: number;
  };
  alerts: {
    urgent: boolean;
    warning: boolean;
    message: string;
  };
}
