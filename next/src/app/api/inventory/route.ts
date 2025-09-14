import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCOGS, updateAverageCost } from "@/lib/costing";

export async function GET() {
  try {
    const inventoryRecords = await prisma.inventoryRecord.findMany({
      where: {
        item: {
          isService: false, // Only show inventory records for stock items, not services
        },
      },
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

    // Check if the item is a service - services shouldn't have inventory records
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.isService) {
      return NextResponse.json(
        { error: "Cannot create inventory records for services" },
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
      const itemForUpdate = await tx.item.findUnique({
        where: { id: itemId },
      });

      if (!itemForUpdate) {
        throw new Error("Item not found");
      }

      let newStock = itemForUpdate.stock;
      let newAverageCost = itemForUpdate.averageCost || 0;

      if (type === "Purchase" || type === "Return") {
        // Add to stock
        newStock += quantity;

        // Update average cost using the simplified function
        newAverageCost = await updateAverageCost(
          tx,
          itemId,
          quantity,
          unitCost
        );
      } else if (type === "Usage") {
        // Subtract from stock
        newStock = Math.max(0, newStock - quantity);

        // Calculate cost of goods sold using simple average cost
        const cogsResult = await calculateCOGS(tx, itemId, quantity);

        // Update the inventory record with calculated COGS
        await tx.inventoryRecord.update({
          where: { id: inventoryRecord.id },
          data: {
            unitCost: cogsResult.unitCost,
            totalCost: cogsResult.totalCost,
            cogsTotal: cogsResult.totalCost,
          },
        });
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
