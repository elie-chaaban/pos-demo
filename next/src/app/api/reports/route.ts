import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const period = searchParams.get("period") || "today";

    let startDate: Date;
    const endDate: Date = new Date();

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
      };

      sales.forEach((sale) => {
        revenueData.totalSales += sale.subtotal;
        revenueData.totalTax += sale.tax;
        revenueData.totalRevenue += sale.total;

        sale.items.forEach((saleItem) => {
          const itemTotal = saleItem.total;
          const category = saleItem.item.category;
          const employee = saleItem.employee;

          // Use stored commission amounts (fallback to calculated if not stored)
          const employeeCommission =
            saleItem.commissionAmount ??
            (itemTotal * category.commissionRate) / 100;
          const salonOwnerShare =
            saleItem.salonOwnerAmount ??
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
