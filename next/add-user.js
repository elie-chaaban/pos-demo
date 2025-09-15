const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function addUser() {
  try {
    // Get user details from command line arguments or use defaults
    const username = process.argv[2] || "admin";
    const password = process.argv[3] || "admin123";
    const email = process.argv[4] || "admin@salonpos.com";

    console.log("👤 Adding new user...\n");

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log(`❌ Username '${username}' already exists`);
      return;
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        console.log(`❌ Email '${email}' already exists`);
        return;
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        isActive: true,
      },
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ User created successfully!");
    console.log("\nUser Details:");
    console.log(`- Username: ${userWithoutPassword.username}`);
    console.log(`- Email: ${userWithoutPassword.email || "Not provided"}`);
    console.log(`- Active: ${userWithoutPassword.isActive}`);
    console.log(`- Created: ${userWithoutPassword.createdAt}`);
    console.log(`- ID: ${userWithoutPassword.id}`);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage if no arguments provided
if (process.argv.length < 3) {
  console.log("Usage: node add-user.js <username> <password> [email]");
  console.log("Example: node add-user.js john mypassword123 john@example.com");
  console.log("Example: node add-user.js admin admin123");
  process.exit(1);
}

// Run the script
addUser()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
