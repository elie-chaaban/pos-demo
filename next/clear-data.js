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

    console.log("4. Clearing Employee Services...");
    const deletedEmployeeServices = await prisma.employeeService.deleteMany({});
    console.log(
      `   ✅ Deleted ${deletedEmployeeServices.count} employee services`
    );

    console.log("5. Clearing Expenses...");
    const deletedExpenses = await prisma.expense.deleteMany({});
    console.log(`   ✅ Deleted ${deletedExpenses.count} expenses`);

    console.log("6. Clearing Expense Categories...");
    const deletedExpenseCategories = await prisma.expenseCategory.deleteMany(
      {}
    );
    console.log(
      `   ✅ Deleted ${deletedExpenseCategories.count} expense categories`
    );

    console.log("7. Clearing Items...");
    const deletedItems = await prisma.item.deleteMany({});
    console.log(`   ✅ Deleted ${deletedItems.count} items`);

    console.log("8. Clearing Employees...");
    const deletedEmployees = await prisma.employee.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEmployees.count} employees`);

    console.log("9. Clearing Customers...");
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomers.count} customers`);

    console.log("10. Clearing Users...");
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    console.log("11. Clearing Settings...");
    const deletedSettings = await prisma.setting.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSettings.count} settings`);

    console.log("\n🎉 Data cleanup completed successfully!");
    console.log("\nSummary:");
    console.log(`- Sale Items: ${deletedSaleItems.count}`);
    console.log(`- Sales: ${deletedSales.count}`);
    console.log(`- Inventory Records: ${deletedInventoryRecords.count}`);
    console.log(`- Employee Services: ${deletedEmployeeServices.count}`);
    console.log(`- Expenses: ${deletedExpenses.count}`);
    console.log(`- Expense Categories: ${deletedExpenseCategories.count}`);
    console.log(`- Items: ${deletedItems.count}`);
    console.log(`- Employees: ${deletedEmployees.count}`);
    console.log(`- Customers: ${deletedCustomers.count}`);
    console.log(`- Users: ${deletedUsers.count}`);
    console.log(`- Settings: ${deletedSettings.count}`);
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
