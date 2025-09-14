#!/usr/bin/env node

/**
 * Migration script to help transition from SQLite to MySQL
 * This script provides commands to set up MySQL and migrate data
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 MySQL Migration Helper");
console.log("========================\n");

// Check if .env.local exists
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.log("⚠️  No .env.local file found!");
  console.log(
    "Please create a .env.local file with your MySQL connection string:"
  );
  console.log(
    'DATABASE_URL="mysql://username:password@localhost:3306/salon_pos_dev"\n'
  );
  process.exit(1);
}

// Read environment variables
require("dotenv").config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.log("❌ DATABASE_URL not found in .env.local");
  console.log(
    'Please add: DATABASE_URL="mysql://username:password@localhost:3306/salon_pos_dev"'
  );
  process.exit(1);
}

console.log("✅ Environment configuration found");
console.log(
  `📊 Database URL: ${process.env.DATABASE_URL.replace(
    /\/\/.*@/,
    "//***:***@"
  )}\n`
);

// Parse database URL to extract connection details
const url = new URL(process.env.DATABASE_URL);
const dbName = url.pathname.substring(1);

console.log("📋 Migration Steps:");
console.log("==================");
console.log("1. Install dependencies: npm install");
console.log("2. Generate Prisma client: npm run db:generate");
console.log("3. Push schema to database: npm run db:push");
console.log("4. Seed the database: npm run db:seed");
console.log("5. Start the application: npm run dev\n");

console.log("🔧 Available Commands:");
console.log("======================");
console.log("npm run db:generate  - Generate Prisma client");
console.log("npm run db:push      - Push schema to database");
console.log("npm run db:migrate   - Create and run migrations");
console.log("npm run db:seed      - Seed database with initial data");
console.log("npm run db:reset     - Reset database and reseed");
console.log("npm run db:studio    - Open Prisma Studio\n");

console.log("💡 Tips:");
console.log("========");
console.log("- Make sure MySQL server is running");
console.log("- Ensure the database exists: CREATE DATABASE " + dbName + ";");
console.log("- Check user permissions for the database");
console.log("- For production, use SSL: ?sslmode=require");
console.log("- Consider connection pooling for better performance\n");

console.log(
  "🎯 Ready to migrate! Run the commands above to complete the setup."
);
