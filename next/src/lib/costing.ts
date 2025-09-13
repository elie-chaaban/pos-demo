import { Prisma } from "@prisma/client";

export interface CostCalculationResult {
  totalCost: number;
  unitCost: number;
  usedBatches?: Array<{
    batchId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

/**
 * Calculate cost of goods sold using LIFO method within a transaction
 */
export async function calculateCOGSLIFO(
  tx: Prisma.TransactionClient,
  itemId: string,
  quantity: number
): Promise<CostCalculationResult> {
  // Get all inventory batches for this item, sorted by date (newest first)
  const batches = await tx.inventoryBatch.findMany({
    where: {
      itemId,
      remainingQuantity: { gt: 0 },
    },
    orderBy: { date: "desc" }, // Newest first for LIFO
  });

  if (batches.length === 0) {
    return { totalCost: 0, unitCost: 0 };
  }

  let remainingQuantity = quantity;
  let totalCost = 0;
  const usedBatches: Array<{
    batchId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }> = [];

  for (const batch of batches) {
    if (remainingQuantity <= 0) break;

    const usedFromBatch = Math.min(remainingQuantity, batch.remainingQuantity);
    const batchCost = usedFromBatch * batch.unitCost;

    totalCost += batchCost;
    remainingQuantity -= usedFromBatch;

    usedBatches.push({
      batchId: batch.id,
      quantity: usedFromBatch,
      unitCost: batch.unitCost,
      totalCost: batchCost,
    });

    // Update the batch's remaining quantity within the transaction
    await tx.inventoryBatch.update({
      where: { id: batch.id },
      data: { remainingQuantity: batch.remainingQuantity - usedFromBatch },
    });
  }

  const unitCost = quantity > 0 ? totalCost / quantity : 0;

  return { totalCost, unitCost, usedBatches };
}

/**
 * Calculate cost of goods sold using Weighted Average method within a transaction
 */
export async function calculateCOGSWeightedAverage(
  tx: Prisma.TransactionClient,
  itemId: string,
  quantity: number
): Promise<CostCalculationResult> {
  // Get all inventory batches for this item
  const batches = await tx.inventoryBatch.findMany({
    where: {
      itemId,
      remainingQuantity: { gt: 0 },
    },
  });

  if (batches.length === 0) {
    return { totalCost: 0, unitCost: 0 };
  }

  // Calculate weighted average cost
  let totalValue = 0;
  let totalQuantity = 0;

  for (const batch of batches) {
    totalValue += batch.remainingQuantity * batch.unitCost;
    totalQuantity += batch.remainingQuantity;
  }

  const weightedAverageCost =
    totalQuantity > 0 ? totalValue / totalQuantity : 0;
  const totalCost = quantity * weightedAverageCost;

  // Update batch quantities proportionally
  const usedBatches: Array<{
    batchId: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }> = [];

  let remainingQuantity = quantity;
  for (const batch of batches) {
    if (remainingQuantity <= 0) break;

    const proportion = batch.remainingQuantity / totalQuantity;
    const usedFromBatch = Math.min(
      remainingQuantity,
      Math.floor(quantity * proportion)
    );

    if (usedFromBatch > 0) {
      const batchCost = usedFromBatch * batch.unitCost;

      usedBatches.push({
        batchId: batch.id,
        quantity: usedFromBatch,
        unitCost: batch.unitCost,
        totalCost: batchCost,
      });

      // Update the batch's remaining quantity within the transaction
      await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: { remainingQuantity: batch.remainingQuantity - usedFromBatch },
      });

      remainingQuantity -= usedFromBatch;
    }
  }

  return { totalCost, unitCost: weightedAverageCost, usedBatches };
}

/**
 * Get the current costing method from settings within a transaction
 */
export async function getCostingMethod(
  tx: Prisma.TransactionClient
): Promise<string> {
  const setting = await tx.setting.findUnique({
    where: { key: "costingMethod" },
  });

  return setting?.value || "LIFO"; // Default to LIFO
}

/**
 * Calculate cost of goods sold based on the current costing method setting within a transaction
 */
export async function calculateCOGS(
  tx: Prisma.TransactionClient,
  itemId: string,
  quantity: number
): Promise<CostCalculationResult> {
  const costingMethod = await getCostingMethod(tx);

  if (costingMethod === "LIFO") {
    return calculateCOGSLIFO(tx, itemId, quantity);
  } else {
    return calculateCOGSWeightedAverage(tx, itemId, quantity);
  }
}
