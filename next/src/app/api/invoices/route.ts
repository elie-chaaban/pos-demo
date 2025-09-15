import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    let dateFilter: any = {};
    if (period !== "all") {
      const now = new Date();
      let start: Date;

      switch (period) {
        case "today":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(0);
      }

      dateFilter.gte = start;
    }

    // Add custom date range if provided
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    }

    const invoices = await prisma.sale.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
            employee: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Transform the data to include calculated fields
    const transformedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.date,
      customer: invoice.customer,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      itemCount: invoice.items.length,
      totalQuantity: invoice.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      items: invoice.items.map((saleItem) => ({
        id: saleItem.id,
        itemName: saleItem.item.name,
        itemPrice: saleItem.price,
        quantity: saleItem.quantity,
        total: saleItem.total,
        employeeName: saleItem.employee.name,
        commissionRate: saleItem.commissionRate,
        commissionAmount: saleItem.commissionAmount,
        isService: saleItem.item.isService,
      })),
      createdAt: invoice.createdAt,
    }));

    return NextResponse.json({
      invoices: transformedInvoices,
      total: transformedInvoices.length,
      totalRevenue: transformedInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
      ),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
