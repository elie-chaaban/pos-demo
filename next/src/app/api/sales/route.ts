import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
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
      orderBy: { date: "desc" },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, subtotal, tax, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (subtotal === undefined || tax === undefined || total === undefined) {
      return NextResponse.json(
        { error: "Subtotal, tax, and total are required" },
        { status: 400 }
      );
    }

    // Create the sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          customerId: customerId || null,
          subtotal,
          tax,
          total,
        },
      });

      // Create sale items and update inventory
      for (const item of items) {
        const { itemId, employeeId, quantity, price, total: itemTotal } = item;

        // Create sale item
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            itemId,
            employeeId,
            quantity,
            price,
            total: itemTotal,
          },
        });

        // Get item details to check if it's a product (needs stock tracking)
        const itemDetails = await tx.item.findUnique({
          where: { id: itemId },
          include: { category: true },
        });

        if (itemDetails) {
          // Check if this is a product category (needs stock tracking)
          const isProductCategory = ["cat3", "cat5"].includes(
            itemDetails.categoryId
          );

          if (isProductCategory) {
            // Update stock
            await tx.item.update({
              where: { id: itemId },
              data: {
                stock: {
                  decrement: quantity,
                },
              },
            });

            // Create inventory record for usage
            await tx.inventoryRecord.create({
              data: {
                itemId,
                saleId: newSale.id,
                type: "Usage",
                quantity: -quantity, // Negative for usage
                unitCost: itemDetails.averageCost || 0,
                totalCost: (itemDetails.averageCost || 0) * quantity,
              },
            });
          }
        }
      }

      // Return the complete sale with all relations
      return await tx.sale.findUnique({
        where: { id: newSale.id },
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
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
