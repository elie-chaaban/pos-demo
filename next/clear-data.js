const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log("🗑️  Starting data cleanup...\n");

    // Clear data in the correct order to respect foreign key constraints
    console.log("1. Clearing SaleItems...");
    const deletedSaleItems = await prisma.saleItem.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSaleItems.count} sale items`);

    console.log("2. Clearing Sales...");
    const deletedSales = await prisma.sale.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSales.count} sales`);

    console.log("3. Clearing Inventory Records...");
    const deletedInventoryRecords = await prisma.inventoryRecord.deleteMany({});
    console.log(
      `   ✅ Deleted ${deletedInventoryRecords.count} inventory records`
    );

    console.log("4. Clearing Items...");
    const deletedItems = await prisma.item.deleteMany({});
    console.log(`   ✅ Deleted ${deletedItems.count} items`);

    console.log("\n🎉 Data cleanup completed successfully!");
    console.log("\nSummary:");
    console.log(`- Sale Items: ${deletedSaleItems.count}`);
    console.log(`- Sales: ${deletedSales.count}`);
    console.log(`- Inventory Records: ${deletedInventoryRecords.count}`);
    console.log(`- Items: ${deletedItems.count}`);
  } catch (error) {
    console.error("❌ Error during data cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
