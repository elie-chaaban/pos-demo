import { Prisma } from "@prisma/client";

export interface CostCalculationResult {
  totalCost: number;
  unitCost: number;
}

/**
 * Calculate cost of goods sold using simple average cost method
 * This is perfect for beauty lounges where simplicity is key
 */
export async function calculateCOGS(
  tx: Prisma.TransactionClient,
  itemId: string,
  quantity: number
): Promise<CostCalculationResult> {
  // Get the current item with its average cost
  const item = await tx.item.findUnique({
    where: { id: itemId },
    select: { averageCost: true, stock: true },
  });

  if (!item || !item.averageCost) {
    return { totalCost: 0, unitCost: 0 };
  }

  const unitCost = item.averageCost;
  const totalCost = quantity * unitCost;

  return { totalCost, unitCost };
}

/**
 * Update average cost when purchasing inventory
 * Uses weighted average: (currentValue + newValue) / (currentQuantity + newQuantity)
 */
export async function updateAverageCost(
  tx: Prisma.TransactionClient,
  itemId: string,
  newQuantity: number,
  newUnitCost: number
): Promise<number> {
  const item = await tx.item.findUnique({
    where: { id: itemId },
    select: { averageCost: true, stock: true },
  });

  if (!item) {
    return newUnitCost;
  }

  const currentValue = (item.averageCost || 0) * item.stock;
  const newValue = newQuantity * newUnitCost;
  const totalQuantity = item.stock + newQuantity;

  if (totalQuantity > 0) {
    return (currentValue + newValue) / totalQuantity;
  }

  return newUnitCost;
}
