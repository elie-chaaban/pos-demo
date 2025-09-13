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
          item: {
            include: {
              category: true,
            },
          },
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
          category: saleItem.item.category.name,
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

// Helper function to generate category sales report
async function generateCategorySalesReport(startDate: Date, endDate: Date) {
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
          item: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const categoryMap = new Map();
  let totalSales = 0;

  sales.forEach((sale) => {
    sale.items.forEach((saleItem) => {
      const categoryId = saleItem.item.category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: saleItem.item.category.name,
          totalSales: 0,
          itemCount: 0,
          averagePrice: 0,
          commissionRate: saleItem.item.category.commissionRate,
          marketShare: 0,
        });
      }
      const category = categoryMap.get(categoryId);
      category.totalSales += saleItem.total;
      category.itemCount += saleItem.quantity;
      totalSales += saleItem.total;
    });
  });

  // Calculate averages and market share
  categoryMap.forEach((category) => {
    category.averagePrice =
      category.itemCount > 0 ? category.totalSales / category.itemCount : 0;
    category.marketShare =
      totalSales > 0 ? (category.totalSales / totalSales) * 100 : 0;
  });

  return {
    categories: Array.from(categoryMap.values()).sort(
      (a, b) => b.totalSales - a.totalSales
    ),
    summary: {
      totalCategories: categoryMap.size,
      totalSales: totalSales,
      topCategory:
        Array.from(categoryMap.values()).sort(
          (a, b) => b.totalSales - a.totalSales
        )[0]?.name || "N/A",
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
                include: {
                  category: true,
                },
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
        byCategory: {} as any,
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
          const category = saleItem.item.category;
          const employee = saleItem.employee;
          totalItemsSold += saleItem.quantity;

          // Use stored commission amounts (fallback to calculated if not stored)
          const employeeCommission =
            (saleItem as any).commissionAmount ??
            (itemTotal * category.commissionRate) / 100;
          const salonOwnerShare =
            (saleItem as any).salonOwnerAmount ??
            (itemTotal * category.salonOwnerRate) / 100;

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

          // Track by category
          if (!revenueData.byCategory[category.id]) {
            revenueData.byCategory[category.id] = {
              name: category.name,
              totalSales: 0,
              employeeCommission: 0,
              salonOwnerShare: 0,
            };
          }
          revenueData.byCategory[category.id].totalSales += itemTotal;
          revenueData.byCategory[category.id].employeeCommission +=
            employeeCommission;
          revenueData.byCategory[category.id].salonOwnerShare +=
            salonOwnerShare;
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
          item: {
            include: {
              category: true,
            },
          },
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
            category: record.item.category.name,
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

    if (type === "category-sales") {
      const categorySalesData = await generateCategorySalesReport(
        startDate,
        endDate
      );
      return NextResponse.json(categorySalesData);
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
