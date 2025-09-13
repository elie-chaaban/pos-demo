import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryRecord = await prisma.inventoryRecord.findUnique({
      where: { id: params.id },
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
    });

    if (!inventoryRecord) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryRecord);
  } catch (error) {
    console.error("Error fetching inventory record:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update inventory record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the original record
      const originalRecord = await tx.inventoryRecord.findUnique({
        where: { id: params.id },
      });

      if (!originalRecord) {
        throw new Error("Inventory record not found");
      }

      // Update the inventory record
      const inventoryRecord = await tx.inventoryRecord.update({
        where: { id: params.id },
        data: {
          date: date ? new Date(date) : originalRecord.date,
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

      // Recalculate item stock and average cost
      const item = await tx.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      // Get all inventory records for this item to recalculate
      const allRecords = await tx.inventoryRecord.findMany({
        where: { itemId },
        orderBy: { date: "asc" },
      });

      let currentStock = 0;
      let totalValue = 0;
      let totalQuantity = 0;

      for (const record of allRecords) {
        if (record.type === "Purchase" || record.type === "Return") {
          currentStock += record.quantity;
          totalValue += record.totalCost;
          totalQuantity += record.quantity;
        } else if (record.type === "Usage") {
          currentStock = Math.max(0, currentStock - record.quantity);
        } else if (record.type === "Adjustment") {
          currentStock = record.quantity;
        }
      }

      const newAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Update the item
      await tx.item.update({
        where: { id: itemId },
        data: {
          stock: currentStock,
          averageCost: newAverageCost,
        },
      });

      return inventoryRecord;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating inventory record:", error);
    return NextResponse.json(
      { error: "Failed to update inventory record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete inventory record in a transaction
    await prisma.$transaction(async (tx) => {
      // Get the record to find the item
      const record = await tx.inventoryRecord.findUnique({
        where: { id: params.id },
      });

      if (!record) {
        throw new Error("Inventory record not found");
      }

      // Delete the record
      await tx.inventoryRecord.delete({
        where: { id: params.id },
      });

      // Recalculate item stock and average cost
      const allRecords = await tx.inventoryRecord.findMany({
        where: { itemId: record.itemId },
        orderBy: { date: "asc" },
      });

      let currentStock = 0;
      let totalValue = 0;
      let totalQuantity = 0;

      for (const invRecord of allRecords) {
        if (invRecord.type === "Purchase" || invRecord.type === "Return") {
          currentStock += invRecord.quantity;
          totalValue += invRecord.totalCost;
          totalQuantity += invRecord.quantity;
        } else if (invRecord.type === "Usage") {
          currentStock = Math.max(0, currentStock - invRecord.quantity);
        } else if (invRecord.type === "Adjustment") {
          currentStock = invRecord.quantity;
        }
      }

      const newAverageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Update the item
      await tx.item.update({
        where: { id: record.itemId },
        data: {
          stock: currentStock,
          averageCost: newAverageCost,
        },
      });
    });

    return NextResponse.json({
      message: "Inventory record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory record:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory record" },
      { status: 500 }
    );
  }
}
