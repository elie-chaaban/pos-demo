import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      email: "admin@salonpos.com",
      isActive: true,
    },
  });

  // Note: User roles removed - no longer needed with direct employee-service assignments

  // Create expense categories
  const expenseCategories = [
    { id: "exp1", name: "Rent", description: "Monthly rent payments" },
    {
      id: "exp2",
      name: "Utilities",
      description: "Electricity, gas, water bills",
    },
    {
      id: "exp3",
      name: "Insurance",
      description: "Business insurance, liability insurance",
    },
    {
      id: "exp4",
      name: "Marketing",
      description: "Advertising, promotions, social media",
    },
    {
      id: "exp5",
      name: "Equipment",
      description: "Equipment purchases and maintenance",
    },
    {
      id: "exp6",
      name: "Supplies",
      description: "General supplies, cleaning products",
    },
    {
      id: "exp7",
      name: "Professional Services",
      description: "Legal, accounting, consulting",
    },
    {
      id: "exp8",
      name: "Training",
      description: "Employee training, courses, certifications",
    },
    {
      id: "exp9",
      name: "Other",
      description: "Miscellaneous business expenses",
    },
  ];

  for (const category of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  // Create service/product categories
  // Note: Categories removed - no longer using item categories

  // Create employees
  const employees = [
    {
      id: "emp1",
      name: "Gilbert Atallah",
      email: "gilbert@ddsalon.com",
      phone: "555-0101",
    },
    {
      id: "emp2",
      name: "elie",
      email: "eliech@ddsalon.com",
      phone: "555-0102",
    },
    {
      id: "emp3",
      name: "Sarah Johnson",
      email: "sarah@ddsalon.com",
      phone: "555-0103",
    },
    {
      id: "emp4",
      name: "Mike Chen",
      email: "mike@ddsalon.com",
      phone: "555-0104",
    },
    {
      id: "emp5",
      name: "Lisa Rodriguez",
      email: "lisa@ddsalon.com",
      phone: "555-0105",
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { id: employee.id },
      update: {},
      create: employee,
    });
  }

  // Note: Employee-role relationships removed - now using direct employee-service assignments

  // Create customers
  const customers = [
    {
      id: "cust1",
      name: "Alice Johnson",
      email: "alice@email.com",
      phone: "555-1001",
      address: "123 Main St, City, State 12345",
    },
    {
      id: "cust2",
      name: "Bob Smith",
      email: "bob@email.com",
      phone: "555-1002",
      address: "456 Oak Ave, City, State 12345",
    },
    {
      id: "cust3",
      name: "Carol Davis",
      email: "carol@email.com",
      phone: "555-1003",
      address: "789 Pine Rd, City, State 12345",
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }

  // Create items
  const items = [
    {
      id: "item1",
      name: "Haircut & Style",
      price: 45.0,
      stock: 0,
      isService: true,
      description: "Professional haircut and styling service",
      averageCost: 0,
    },
    {
      id: "item2",
      name: "Hair Color",
      price: 85.0,
      stock: 0,
      isService: true,
      description: "Full hair coloring service",
      averageCost: 0,
    },
    {
      id: "item3",
      name: "Manicure",
      price: 25.0,
      stock: 0,
      isService: true,
      description: "Basic manicure service",
      averageCost: 0,
    },
    {
      id: "item4",
      name: "Shampoo Bottle",
      price: 15.0,
      stock: 50,
      isService: false,
      description: "Professional shampoo 500ml",
      averageCost: 8.0,
      reorderThreshold: 10,
    },
    {
      id: "item5",
      name: "Laser Hair Removal - Face",
      price: 75.0,
      stock: 0,
      isService: true,
      description: "Laser hair removal treatment for facial area",
      averageCost: 0,
    },
    {
      id: "item6",
      name: "Hair Treatment",
      price: 65.0,
      stock: 0,
      isService: true,
      description: "Deep conditioning hair treatment",
      averageCost: 0,
    },
    {
      id: "item7",
      name: "Pedicure",
      price: 35.0,
      stock: 0,
      isService: true,
      description: "Professional pedicure service",
      averageCost: 0,
    },
    {
      id: "item8",
      name: "Nail Art",
      price: 45.0,
      stock: 0,
      isService: true,
      description: "Custom nail art design",
      averageCost: 0,
    },
    {
      id: "item9",
      name: "Facial Treatment",
      price: 80.0,
      stock: 0,
      isService: true,
      description: "Professional facial treatment",
      averageCost: 0,
    },
    {
      id: "item10",
      name: "Hair Dye Kit",
      price: 25.0,
      stock: 3,
      isService: false,
      description: "Professional hair coloring kit",
      averageCost: 12.0,
      reorderThreshold: 5,
    },
    {
      id: "item11",
      name: "Nail Polish",
      price: 8.0,
      stock: 0,
      isService: false,
      description: "Premium nail polish 15ml",
      averageCost: 4.0,
      reorderThreshold: 8,
    },
    {
      id: "item12",
      name: "Face Cream",
      price: 35.0,
      stock: 2,
      isService: false,
      description: "Anti-aging face cream 50ml",
      averageCost: 18.0,
      reorderThreshold: 3,
    },
    {
      id: "item13",
      name: "Hair Brush Set",
      price: 20.0,
      stock: 15,
      isService: false,
      description: "Professional hair brush set",
      averageCost: 10.0,
      reorderThreshold: 5,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Create employee-service assignments (replaces category-role system)
  const employeeServices = [
    // Gilbert (Hairdresser + Salon Owner) - Hair services and products
    { employeeId: "emp1", itemId: "item1", commissionRate: 15 }, // Haircut & Style
    { employeeId: "emp1", itemId: "item2", commissionRate: 20 }, // Hair Color
    { employeeId: "emp1", itemId: "item4", commissionRate: 5 }, // Shampoo Bottle
    { employeeId: "emp1", itemId: "item6", commissionRate: 15 }, // Hair Treatment

    // elie (Salon Owner) - All services and products
    { employeeId: "emp2", itemId: "item1", commissionRate: 10 }, // Haircut & Style
    { employeeId: "emp2", itemId: "item2", commissionRate: 15 }, // Hair Color
    { employeeId: "emp2", itemId: "item3", commissionRate: 20 }, // Manicure
    { employeeId: "emp2", itemId: "item4", commissionRate: 5 }, // Shampoo Bottle
    { employeeId: "emp2", itemId: "item5", commissionRate: 25 }, // Laser Hair Removal - Face
    { employeeId: "emp2", itemId: "item6", commissionRate: 15 }, // Hair Treatment
    { employeeId: "emp2", itemId: "item7", commissionRate: 25 }, // Pedicure
    { employeeId: "emp2", itemId: "item8", commissionRate: 20 }, // Nail Art
    { employeeId: "emp2", itemId: "item9", commissionRate: 30 }, // Facial Treatment

    // Sarah (Nail Technician) - Nail services and products
    { employeeId: "emp3", itemId: "item3", commissionRate: 20 }, // Manicure
    { employeeId: "emp3", itemId: "item7", commissionRate: 25 }, // Pedicure
    { employeeId: "emp3", itemId: "item8", commissionRate: 20 }, // Nail Art

    // Mike (Receptionist) - Products only (no services)
    { employeeId: "emp4", itemId: "item4", commissionRate: 3 }, // Shampoo Bottle

    // Lisa (Laser Technician + Salon Owner) - Laser services and face treatments
    { employeeId: "emp5", itemId: "item5", commissionRate: 25 }, // Laser Hair Removal - Face
    { employeeId: "emp5", itemId: "item9", commissionRate: 30 }, // Facial Treatment
  ];

  for (const employeeService of employeeServices) {
    await (prisma as any).employeeService.upsert({
      where: {
        employeeId_itemId: {
          employeeId: employeeService.employeeId,
          itemId: employeeService.itemId,
        },
      },
      update: {},
      create: employeeService,
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
