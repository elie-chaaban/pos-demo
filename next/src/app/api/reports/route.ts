import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to generate item sales report
async function generateItemSalesReport(startDate: Date, endDate: Date) {
  const sales = await prisma.sale.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: {
        include: {
          item: {},
        },
      },
    },
  });

  const itemMap = new Map();

  sales.forEach((sale) => {
    sale.items.forEach((saleItem) => {
      const itemId = saleItem.item.id;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          id: itemId,
          name: saleItem.item.name,
          quantitySold: 0,
          revenue: 0,
          averagePrice: 0,
          profitMargin: 0,
        });
      }
      const item = itemMap.get(itemId);
      item.quantitySold += saleItem.quantity;
      item.revenue += saleItem.total;
    });
  });

  // Calculate averages and profit margins
  itemMap.forEach((item) => {
    item.averagePrice =
      item.quantitySold > 0 ? item.revenue / item.quantitySold : 0;
    // Assuming 30% profit margin for demo purposes
    item.profitMargin = 30;
  });

  return {
    items: Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue),
    summary: {
      totalItems: itemMap.size,
      totalRevenue: Array.from(itemMap.values()).reduce(
        (sum, item) => sum + item.revenue,
        0
      ),
      totalQuantitySold: Array.from(itemMap.values()).reduce(
        (sum, item) => sum + item.quantitySold,
        0
      ),
    },
  };
}

// Helper function to generate customer sales report
async function generateCustomerSalesReport(startDate: Date, endDate: Date) {
  const sales = await prisma.sale.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: true,
    },
  });

  const customerMap = new Map();

  sales.forEach((sale) => {
    if (sale.customer) {
      const customerId = sale.customer.id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: sale.customer.name,
          email: sale.customer.email || "",
          totalSpent: 0,
          transactionCount: 0,
          averageOrderValue: 0,
          lastPurchase: sale.date,
        });
      }
      const customer = customerMap.get(customerId);
      customer.totalSpent += sale.total;
      customer.transactionCount += 1;
      if (sale.date > customer.lastPurchase) {
        customer.lastPurchase = sale.date;
      }
    }
  });

  // Calculate averages
  customerMap.forEach((customer) => {
    customer.averageOrderValue =
      customer.transactionCount > 0
        ? customer.totalSpent / customer.transactionCount
        : 0;
  });

  return {
    customers: Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    ),
    summary: {
      totalCustomers: customerMap.size,
      totalRevenue: Array.from(customerMap.values()).reduce(
        (sum, customer) => sum + customer.totalSpent,
        0
      ),
      averageCustomerValue:
        customerMap.size > 0
          ? Array.from(customerMap.values()).reduce(
              (sum, customer) => sum + customer.totalSpent,
              0
            ) / customerMap.size
          : 0,
    },
  };
}

// Helper function to generate expenses report
async function generateExpensesReport(startDate: Date, endDate: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const expensesData = expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category.name,
    paymentMethod: expense.paymentMethod,
    date: expense.date.toISOString(),
    vendor: expense.notes || null,
  }));

  return {
    expenses: expensesData,
    summary: {
      totalExpenses: expensesData.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
      totalCount: expensesData.length,
      averageExpense:
        expensesData.length > 0
          ? expensesData.reduce((sum, expense) => sum + expense.amount, 0) /
            expensesData.length
          : 0,
    },
  };
}

// Helper function to generate customer lifetime value report
async function generateCustomerLifetimeValueReport(
  startDate: Date,
  endDate: Date
) {
  // Get all sales data for customers (not limited by date range for lifetime calculation)
  const allSales = await prisma.sale.findMany({
    include: {
      customer: true,
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Get all customers
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const customerMap = new Map();

  // Initialize all customers
  customers.forEach((customer) => {
    customerMap.set(customer.id, {
      id: customer.id,
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      totalLifetimeValue: 0,
      totalTransactions: 0,
      averageOrderValue: 0,
      firstPurchase: null,
      lastPurchase: null,
      daysSinceLastPurchase: 0,
      purchaseFrequency: 0, // purchases per month
      customerLifespan: 0, // days between first and last purchase
      clvTier: "Bronze", // Bronze, Silver, Gold, Platinum
      recentActivity: 0, // value in selected period
      recentTransactions: 0, // transactions in selected period
    });
  });

  // Calculate lifetime metrics
  allSales.forEach((sale) => {
    if (sale.customer) {
      const customerId = sale.customer.id;
      const customer = customerMap.get(customerId);

      if (customer) {
        customer.totalLifetimeValue += sale.total;
        customer.totalTransactions += 1;

        // Track first and last purchase
        if (!customer.firstPurchase || sale.date < customer.firstPurchase) {
          customer.firstPurchase = sale.date;
        }
        if (!customer.lastPurchase || sale.date > customer.lastPurchase) {
          customer.lastPurchase = sale.date;
        }

        // Track recent activity (within selected period)
        if (sale.date >= startDate && sale.date <= endDate) {
          customer.recentActivity += sale.total;
          customer.recentTransactions += 1;
        }
      }
    }
  });

  // Calculate derived metrics and categorize customers
  const now = new Date();
  customerMap.forEach((customer) => {
    if (customer.totalTransactions > 0) {
      customer.averageOrderValue =
        customer.totalLifetimeValue / customer.totalTransactions;

      if (customer.lastPurchase) {
        customer.daysSinceLastPurchase = Math.floor(
          (now.getTime() - customer.lastPurchase.getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      if (customer.firstPurchase && customer.lastPurchase) {
        customer.customerLifespan = Math.floor(
          (customer.lastPurchase.getTime() - customer.firstPurchase.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Calculate purchase frequency (purchases per month)
        const monthsActive = Math.max(1, customer.customerLifespan / 30);
        customer.purchaseFrequency = customer.totalTransactions / monthsActive;
      }

      // Categorize customers by CLV tier
      if (customer.totalLifetimeValue >= 1000) {
        customer.clvTier = "Platinum";
      } else if (customer.totalLifetimeValue >= 500) {
        customer.clvTier = "Gold";
      } else if (customer.totalLifetimeValue >= 200) {
        customer.clvTier = "Silver";
      } else {
        customer.clvTier = "Bronze";
      }
    }
  });

  // Convert to array and sort by lifetime value
  const clvData = Array.from(customerMap.values())
    .filter((customer) => customer.totalTransactions > 0) // Only include customers with purchases
    .sort((a, b) => b.totalLifetimeValue - a.totalLifetimeValue);

  // Calculate summary statistics
  const totalCustomers = clvData.length;
  const totalLifetimeValue = clvData.reduce(
    (sum, customer) => sum + customer.totalLifetimeValue,
    0
  );
  const averageLifetimeValue =
    totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0;

  // Tier distribution
  const tierDistribution = {
    Platinum: clvData.filter((c) => c.clvTier === "Platinum").length,
    Gold: clvData.filter((c) => c.clvTier === "Gold").length,
    Silver: clvData.filter((c) => c.clvTier === "Silver").length,
    Bronze: clvData.filter((c) => c.clvTier === "Bronze").length,
  };

  // Top customers by recent activity
  const topRecentCustomers = clvData
    .filter((customer) => customer.recentActivity > 0)
    .sort((a, b) => b.recentActivity - a.recentActivity)
    .slice(0, 10);

  return {
    customers: clvData,
    summary: {
      totalCustomers,
      totalLifetimeValue,
      averageLifetimeValue,
      tierDistribution,
      topRecentCustomers,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
    },
  };
}

// Helper function to generate low stock alert report
async function generateLowStockReport() {
  const items = await prisma.item.findMany({
    where: {
      isService: false, // Only physical items, not services
    },
    orderBy: {
      stock: "asc",
    },
  });

  const lowStockItems = items.filter((item) => {
    const threshold = item.reorderThreshold ?? 5; // Default to 5 if not set
    return item.stock <= threshold;
  });

  const outOfStockItems = items.filter((item) => item.stock === 0);
  const criticalStockItems = lowStockItems.filter((item) => item.stock === 0);
  const warningStockItems = lowStockItems.filter((item) => item.stock > 0);

  // Calculate total inventory value at risk
  const totalValueAtRisk = lowStockItems.reduce((sum, item) => {
    return sum + item.stock * (item.averageCost || 0);
  }, 0);

  // Calculate potential lost sales (items that could be sold if in stock)
  const potentialLostSales = lowStockItems.reduce((sum, item) => {
    const threshold = item.reorderThreshold ?? 5;
    const potentialSales = Math.max(0, threshold - item.stock);
    return sum + potentialSales * item.price;
  }, 0);

  const lowStockData = lowStockItems.map((item) => ({
    id: item.id,
    name: item.name,
    currentStock: item.stock,
    reorderThreshold: item.reorderThreshold ?? 5,
    price: item.price,
    averageCost: item.averageCost || 0,
    stockValue: item.stock * (item.averageCost || 0),
    status:
      item.stock === 0
        ? "Out of Stock"
        : item.stock <= (item.reorderThreshold ?? 5) * 0.5
        ? "Critical"
        : "Low",
    daysUntilOutOfStock: item.stock > 0 ? Math.ceil(item.stock / 2) : 0, // Rough estimate
    suggestedReorderQuantity: Math.max((item.reorderThreshold ?? 5) * 2, 10),
    lastUpdated: item.updatedAt.toISOString(),
  }));

  return {
    items: lowStockData,
    summary: {
      totalLowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      criticalStockItems: criticalStockItems.length,
      warningStockItems: warningStockItems.length,
      totalValueAtRisk: totalValueAtRisk,
      potentialLostSales: potentialLostSales,
      averageStockLevel:
        lowStockItems.length > 0
          ? lowStockItems.reduce((sum, item) => sum + item.stock, 0) /
            lowStockItems.length
          : 0,
    },
    alerts: {
      urgent: criticalStockItems.length > 0,
      warning: warningStockItems.length > 0,
      message:
        criticalStockItems.length > 0
          ? `${criticalStockItems.length} items are out of stock!`
          : warningStockItems.length > 0
          ? `${warningStockItems.length} items are running low on stock.`
          : "All items are adequately stocked.",
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const period = searchParams.get("period") || "today";
    const customStartDate = searchParams.get("startDate");
    const customEndDate = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date = new Date();

    // Handle custom date range
    if (period === "custom" && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Set date range based on period
      switch (period) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
      }
    }

    const reports: any = {};

    if (type === "all" || type === "revenue") {
      // Get sales data for the period
      const sales = await prisma.sale.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              item: {
                include: {},
              },
              employee: true,
            },
          },
        },
      });

      // Calculate revenue sharing
      const revenueData = {
        totalSales: 0,
        totalTax: 0,
        totalRevenue: 0,
        employeeEarnings: 0,
        salonOwnerEarnings: 0,
        byEmployee: {} as any,
        // Advanced analytics
        hourlyTrends: {} as any,
        customerAnalytics: {
          totalCustomers: 0,
          repeatCustomers: 0,
          newCustomers: 0,
          averageOrderValue: 0,
          topCustomers: [] as any[],
        },
        profitMargins: {
          grossProfit: 0,
          netProfit: 0,
          profitMargin: 0,
        },
        transactionMetrics: {
          totalTransactions: 0,
          averageTransactionValue: 0,
          itemsPerTransaction: 0,
        },
      };

      // Track customers for analytics
      const customerMap = new Map();
      const customerSales = new Map();
      let totalItemsSold = 0;

      sales.forEach((sale) => {
        revenueData.totalSales += sale.subtotal;
        revenueData.totalTax += sale.tax;
        revenueData.totalRevenue += sale.total;
        revenueData.transactionMetrics.totalTransactions += 1;

        // Track hourly trends
        const hour = new Date(sale.date).getHours();
        if (!revenueData.hourlyTrends[hour]) {
          revenueData.hourlyTrends[hour] = {
            hour: hour,
            sales: 0,
            transactions: 0,
          };
        }
        revenueData.hourlyTrends[hour].sales += sale.total;
        revenueData.hourlyTrends[hour].transactions += 1;

        // Track customer analytics
        if (sale.customer) {
          const customerId = sale.customer.id;
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              id: customerId,
              name: sale.customer.name,
              totalSpent: 0,
              transactionCount: 0,
            });
          }
          const customer = customerMap.get(customerId);
          customer.totalSpent += sale.total;
          customer.transactionCount += 1;
          customerSales.set(customerId, customer);
        }

        sale.items.forEach((saleItem) => {
          const itemTotal = saleItem.total;
          const employee = saleItem.employee;
          totalItemsSold += saleItem.quantity;

          // Use stored commission amounts from employee-specific rates
          const employeeCommission = saleItem.commissionAmount ?? 0;
          const salonOwnerShare = saleItem.salonOwnerAmount ?? 0;

          revenueData.employeeEarnings += employeeCommission;
          revenueData.salonOwnerEarnings += salonOwnerShare;

          // Track by employee
          if (!revenueData.byEmployee[employee.id]) {
            revenueData.byEmployee[employee.id] = {
              name: employee.name,
              totalSales: 0,
              commission: 0,
              itemsSold: 0,
            };
          }
          revenueData.byEmployee[employee.id].totalSales += itemTotal;
          revenueData.byEmployee[employee.id].commission += employeeCommission;
          revenueData.byEmployee[employee.id].itemsSold += saleItem.quantity;
        });
      });

      // Calculate advanced metrics
      revenueData.customerAnalytics.totalCustomers = customerMap.size;
      revenueData.customerAnalytics.repeatCustomers = Array.from(
        customerMap.values()
      ).filter((customer) => customer.transactionCount > 1).length;
      revenueData.customerAnalytics.newCustomers = Array.from(
        customerMap.values()
      ).filter((customer) => customer.transactionCount === 1).length;
      revenueData.customerAnalytics.averageOrderValue =
        revenueData.transactionMetrics.totalTransactions > 0
          ? revenueData.totalSales /
            revenueData.transactionMetrics.totalTransactions
          : 0;
      revenueData.customerAnalytics.topCustomers = Array.from(
        customerMap.values()
      )
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      revenueData.transactionMetrics.averageTransactionValue =
        revenueData.transactionMetrics.totalTransactions > 0
          ? revenueData.totalSales /
            revenueData.transactionMetrics.totalTransactions
          : 0;
      revenueData.transactionMetrics.itemsPerTransaction =
        revenueData.transactionMetrics.totalTransactions > 0
          ? totalItemsSold / revenueData.transactionMetrics.totalTransactions
          : 0;

      reports.revenue = revenueData;
    }

    if (type === "all" || type === "expenses") {
      // Get expenses for the period
      const expenses = await prisma.expense.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          category: true,
        },
      });

      const expenseData = {
        totalExpenses: 0,
        byCategory: {} as any,
        byPaymentMethod: {} as any,
      };

      expenses.forEach((expense) => {
        expenseData.totalExpenses += expense.amount;

        // Track by category
        if (!expenseData.byCategory[expense.category.id]) {
          expenseData.byCategory[expense.category.id] = {
            name: expense.category.name,
            total: 0,
            count: 0,
          };
        }
        expenseData.byCategory[expense.category.id].total += expense.amount;
        expenseData.byCategory[expense.category.id].count += 1;

        // Track by payment method
        if (!expenseData.byPaymentMethod[expense.paymentMethod]) {
          expenseData.byPaymentMethod[expense.paymentMethod] = {
            total: 0,
            count: 0,
          };
        }
        expenseData.byPaymentMethod[expense.paymentMethod].total +=
          expense.amount;
        expenseData.byPaymentMethod[expense.paymentMethod].count += 1;
      });

      reports.expenses = expenseData;
    }

    if (type === "all" || type === "inventory") {
      // Get inventory records for the period
      const inventoryRecords = await prisma.inventoryRecord.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          item: {},
        },
      });

      const inventoryData = {
        totalCost: 0,
        totalUsage: 0,
        byItem: {} as any,
        byType: {} as any,
        // Advanced inventory analytics
        turnoverMetrics: {
          averageTurnoverRate: 0,
          slowMovingItems: [] as any[],
          fastMovingItems: [] as any[],
        },
        costAnalysis: {
          totalInventoryValue: 0,
          averageCostPerItem: 0,
          costVariance: 0,
        },
      };

      inventoryRecords.forEach((record) => {
        inventoryData.totalCost += record.totalCost;

        if (record.type === "Usage") {
          inventoryData.totalUsage += Math.abs(record.quantity);
        }

        // Track by item
        if (!inventoryData.byItem[record.item.id]) {
          inventoryData.byItem[record.item.id] = {
            name: record.item.name,
            totalCost: 0,
            totalQuantity: 0,
          };
        }
        inventoryData.byItem[record.item.id].totalCost += record.totalCost;
        inventoryData.byItem[record.item.id].totalQuantity += Math.abs(
          record.quantity
        );

        // Track by type
        if (!inventoryData.byType[record.type]) {
          inventoryData.byType[record.type] = {
            totalCost: 0,
            totalQuantity: 0,
            count: 0,
          };
        }
        inventoryData.byType[record.type].totalCost += record.totalCost;
        inventoryData.byType[record.type].totalQuantity += Math.abs(
          record.quantity
        );
        inventoryData.byType[record.type].count += 1;
      });

      reports.inventory = inventoryData;
    }

    // Handle specific report types
    if (type === "item-sales") {
      const itemSalesData = await generateItemSalesReport(startDate, endDate);
      return NextResponse.json(itemSalesData);
    }

    if (type === "customer-sales") {
      const customerSalesData = await generateCustomerSalesReport(
        startDate,
        endDate
      );
      return NextResponse.json(customerSalesData);
    }

    if (type === "expenses") {
      const expensesData = await generateExpensesReport(startDate, endDate);
      return NextResponse.json(expensesData);
    }

    if (type === "low-stock") {
      const lowStockData = await generateLowStockReport();
      return NextResponse.json(lowStockData);
    }

    if (type === "customer-lifetime-value") {
      const clvData = await generateCustomerLifetimeValueReport(
        startDate,
        endDate
      );
      return NextResponse.json(clvData);
    }

    return NextResponse.json({
      period,
      startDate,
      endDate,
      ...reports,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
