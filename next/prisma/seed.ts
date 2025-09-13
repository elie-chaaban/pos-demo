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

  // Create user roles first
  const userRoles = [
    {
      id: "role1",
      name: "Hairdresser",
      description:
        "Professional hair stylist who can perform haircuts, styling, coloring, and treatments",
    },
    {
      id: "role2",
      name: "Nail Technician",
      description:
        "Professional nail technician who can perform manicures, pedicures, and nail art",
    },
    {
      id: "role3",
      name: "Salon Owner",
      description:
        "Salon owner with full access to all services and management functions",
    },
    {
      id: "role4",
      name: "Receptionist",
      description:
        "Front desk staff who can handle appointments and basic customer service",
    },
    {
      id: "role5",
      name: "Laser Technician",
      description:
        "Certified laser technician for hair removal and skin treatments",
    },
  ];

  for (const role of userRoles) {
    await prisma.userRole.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

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
  const categories = [
    {
      id: "cat1",
      name: "Hair Services",
      commissionRate: 70,
      salonOwnerRate: 30,
      description:
        "All hair services: haircut, styling, coloring, treatments, etc.",
    },
    {
      id: "cat2",
      name: "Hair Extensions",
      commissionRate: 80,
      salonOwnerRate: 20,
      description: "All types of hair extensions: sales, refill, or rent",
    },
    {
      id: "cat3",
      name: "Hair Products & Accessories",
      commissionRate: 95,
      salonOwnerRate: 5,
      description:
        "Shampoo, conditioners, hair masks, serums, accessories, etc.",
    },
    {
      id: "cat4",
      name: "Nail Services",
      salonOwnerRate: 100,
      description: "All nail services: manicure, pedicure, nail art, etc.",
    },
    {
      id: "cat5",
      name: "Nail Products",
      salonOwnerRate: 100,
      description: "Nail polish, nail art supplies, nail care products, etc.",
    },
    {
      id: "cat6",
      name: "Face Treatments",
      salonOwnerRate: 100,
      description: "Face masks, facial treatments, skincare services, etc.",
    },
    {
      id: "cat7",
      name: "Laser Services",
      commissionRate: 50,
      salonOwnerRate: 50,
      description: "Laser hair removal, skin treatments, and related services",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  // Create category-role relationships
  const categoryRoles = [
    // Hair Services - Hairdresser and Salon Owner
    { categoryId: "cat1", roleId: "role1" },
    { categoryId: "cat1", roleId: "role3" },

    // Hair Extensions - Hairdresser and Salon Owner
    { categoryId: "cat2", roleId: "role1" },
    { categoryId: "cat2", roleId: "role3" },

    // Hair Products - Hairdresser and Salon Owner
    { categoryId: "cat3", roleId: "role1" },
    { categoryId: "cat3", roleId: "role3" },

    // Nail Services - Nail Technician and Salon Owner
    { categoryId: "cat4", roleId: "role2" },
    { categoryId: "cat4", roleId: "role3" },

    // Nail Products - Nail Technician and Salon Owner
    { categoryId: "cat5", roleId: "role2" },
    { categoryId: "cat5", roleId: "role3" },

    // Face Treatments - Salon Owner only
    { categoryId: "cat6", roleId: "role3" },

    // Laser Services - Laser Technician and Salon Owner
    { categoryId: "cat7", roleId: "role5" },
    { categoryId: "cat7", roleId: "role3" },
  ];

  for (const categoryRole of categoryRoles) {
    await prisma.categoryRole.upsert({
      where: {
        categoryId_roleId: {
          categoryId: categoryRole.categoryId,
          roleId: categoryRole.roleId,
        },
      },
      update: {},
      create: categoryRole,
    });
  }

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

  // Create employee-role relationships
  const employeeRoles = [
    // Gilbert - Hairdresser and Salon Owner (can do both)
    { employeeId: "emp1", roleId: "role1" }, // Hairdresser
    { employeeId: "emp1", roleId: "role3" }, // Salon Owner

    // elie - Salon Owner only
    { employeeId: "emp2", roleId: "role3" }, // Salon Owner

    // Sarah - Nail Technician
    { employeeId: "emp3", roleId: "role2" }, // Nail Technician

    // Mike - Receptionist
    { employeeId: "emp4", roleId: "role4" }, // Receptionist

    // Lisa - Laser Technician and Salon Owner (can manage and perform)
    { employeeId: "emp5", roleId: "role5" }, // Laser Technician
    { employeeId: "emp5", roleId: "role3" }, // Salon Owner
  ];

  for (const employeeRole of employeeRoles) {
    await prisma.employeeRole.upsert({
      where: {
        employeeId_roleId: {
          employeeId: employeeRole.employeeId,
          roleId: employeeRole.roleId,
        },
      },
      update: {},
      create: employeeRole,
    });
  }

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
      categoryId: "cat1",
      price: 45.0,
      stock: 0,
      description: "Professional haircut and styling service",
      averageCost: 0,
    },
    {
      id: "item2",
      name: "Hair Color",
      categoryId: "cat1",
      price: 85.0,
      stock: 0,
      description: "Full hair coloring service",
      averageCost: 0,
    },
    {
      id: "item3",
      name: "Manicure",
      categoryId: "cat4",
      price: 25.0,
      stock: 0,
      description: "Basic manicure service",
      averageCost: 0,
    },
    {
      id: "item4",
      name: "Shampoo Bottle",
      categoryId: "cat3",
      price: 15.0,
      stock: 50,
      description: "Professional shampoo 500ml",
      averageCost: 8.0,
    },
    {
      id: "item5",
      name: "Laser Hair Removal - Face",
      categoryId: "cat7",
      price: 75.0,
      stock: 0,
      description: "Laser hair removal treatment for facial area",
      averageCost: 0,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: item,
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
