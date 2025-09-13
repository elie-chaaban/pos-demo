import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const inventoryRecords = await prisma.inventoryRecord.findMany({
      include: {
        item: {
          include: {
            category: true,
          },
        },
        sale: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(inventoryRecords);
  } catch (error) {
    console.error("Error fetching inventory records:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, itemId, type, quantity, unitCost, notes } = body;

    if (!itemId || !type || quantity === undefined || unitCost === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate inventory type
    const validTypes = ["Purchase", "Usage", "Return", "Adjustment"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid inventory type" },
        { status: 400 }
      );
    }

    const totalCost = quantity * unitCost;

    // Create inventory record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the inventory record
      const inventoryRecord = await tx.inventoryRecord.create({
        data: {
          date: date ? new Date(date) : new Date(),
          itemId,
          type,
          quantity,
          unitCost,
          totalCost,
          cogsTotal: type === "Usage" ? totalCost : 0,
        },
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      });

      // Update item stock and average cost
      const item = await tx.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      let newStock = item.stock;
      let newAverageCost = item.averageCost || 0;

      if (type === "Purchase" || type === "Return") {
        // Add to stock
        newStock += quantity;

        // Update average cost using weighted average
        const currentValue = (item.averageCost || 0) * item.stock;
        const newValue = totalCost;
        const totalQuantity = item.stock + quantity;

        if (totalQuantity > 0) {
          newAverageCost = (currentValue + newValue) / totalQuantity;
        }
      } else if (type === "Usage") {
        // Subtract from stock
        newStock = Math.max(0, newStock - quantity);
      } else if (type === "Adjustment") {
        // Direct stock adjustment
        newStock = quantity;
      }

      // Update the item
      await tx.item.update({
        where: { id: itemId },
        data: {
          stock: newStock,
          averageCost: newAverageCost,
        },
      });

      // Create inventory batch for tracking
      if (type === "Purchase" || type === "Return") {
        await tx.inventoryBatch.create({
          data: {
            itemId,
            quantity,
            unitCost,
            type,
            date: date ? new Date(date) : new Date(),
            remainingQuantity: quantity,
          },
        });
      }

      return inventoryRecord;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory record:", error);
    return NextResponse.json(
      { error: "Failed to create inventory record" },
      { status: 500 }
    );
  }
}
