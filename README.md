# Professional POS System

## Complete Business Management Solution for Salons, Spas & Retail

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.1-2D3748)](https://prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightblue)](https://sqlite.org/)

---

## 🏪 **What is This System?**

A modern, comprehensive Point of Sale (POS) system specifically designed for **salons, spas, and retail businesses**. This system handles everything from daily transactions to detailed financial reporting, employee management, and customer relationships.

**Perfect for businesses that need:**

- Commission-based employee tracking
- Service and product sales management
- Detailed financial reporting
- Customer relationship management
- Inventory tracking

---

## ✨ **Key Features**

### 🛒 **Point of Sale Interface**

- **Touch-friendly design** optimized for quick transactions
- **Real-time inventory tracking** with automatic stock updates
- **Service vs Product support** - handles both seamlessly
- **Employee assignment** based on roles and permissions
- **Customer integration** with quick lookup and registration
- **Cart management** with easy quantity adjustments

### 👥 **Customer Management**

- Complete customer profiles (name, email, phone, address, DOB)
- Purchase history tracking
- Customer analytics and insights
- Quick customer lookup during transactions

### 👨‍💼 **Employee Management**

- **Role-based access control** with multiple role assignments
- **Commission tracking** with automatic calculations
- **Category-specific commission rates** - different rates per product/service category
- Performance monitoring and analytics
- Category-specific permissions and access control

### 📦 **Inventory Management**

- Real-time stock tracking
- FIFO and Weighted Average costing methods
- Purchase management and cost tracking
- Low stock alerts
- Cost of Goods Sold (COGS) calculations

### 💰 **Financial Management**

- Expense tracking and categorization
- Payment method monitoring
- Profit & Loss analysis
- **Revenue sharing reports** with category-based splits
- **Automatic commission calculations** based on category rates
- **Salon owner vs employee revenue tracking** per category

### 📊 **Advanced Reporting**

- **Employee Performance Reports** with commission breakdowns by category
- **Customer Analytics** and purchase patterns
- **Inventory Usage Reports** with cost analysis
- **Revenue Sharing Analysis** showing owner vs employee splits per category
- **Profit & Loss Statements** with detailed cost breakdowns
- **Category Performance Analysis** - which categories generate most revenue
- **Commission Reports** showing employee earnings by category
- **Export to CSV** for external analysis

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+ installed
- Modern web browser
- 4GB RAM minimum
- 1GB free disk space

### **Installation**

1. **Clone or download** the system files
2. **Navigate to the project directory:**

   ```bash
   cd next
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up the database:**

   ```bash
   npm run db:reset
   ```

   This will create the database and populate it with sample data.

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser** and go to `http://localhost:3000`

### **Production Deployment**

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

---

## 🎯 **Getting Started Checklist**

After installation, follow these steps to set up your business:

- [ ] **Create User Roles** (e.g., Stylist, Receptionist, Manager)
- [ ] **Add Employee Accounts** with appropriate roles
- [ ] **Set up Categories** with specific commission rates for each category
- [ ] **Configure Revenue Sharing** - set owner vs employee percentage splits per category
- [ ] **Add Inventory Items** and set initial stock levels
- [ ] **Configure Expense Categories**
- [ ] **Add Customer Information**
- [ ] **Test POS Functionality** with sample transactions

---

## 🛠️ **Technology Stack**

- **Frontend:** Next.js 15.5.3 with React 19
- **Backend:** Next.js API Routes
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Icons:** Lucide React
- **UI Components:** Headless UI

---

## 📱 **System Requirements**

### **Server Requirements**

- Node.js 18 or higher
- 4GB RAM minimum (8GB recommended)
- 1GB free disk space
- Modern operating system (Windows, macOS, Linux)

### **Client Requirements**

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for initial setup
- Touch screen recommended for POS interface

---

## 🔧 **Available Scripts**

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start           # Start production server

# Database
npm run db:seed     # Seed database with sample data
npm run db:reset    # Reset database and reseed

# Code Quality
npm run lint        # Run ESLint
```

---

## 📊 **Sample Data**

The system comes with pre-loaded sample data including:

- Sample employees with different roles
- Product and service categories with different commission rates
- Revenue sharing configurations (owner vs employee splits)
- Inventory items with various categories
- Customer records
- Sample transactions showing commission calculations

You can reset to sample data anytime using `npm run db:reset`.

---

## 🔒 **Security Features**

- **Role-based access control**
- **Data validation** on all inputs
- **SQL injection protection** via Prisma ORM
- **Type safety** with TypeScript
- **Input sanitization**

---

## 📈 **Business Benefits**

### **For Business Owners**

- Complete financial control and visibility
- Employee performance monitoring
- Customer relationship management
- Inventory optimization
- Revenue maximization through analytics

### **For Employees**

- Clear commission tracking
- Role-appropriate permissions
- Performance insights
- Streamlined transaction processing

### **For Customers**

- Faster checkout process
- Purchase history tracking
- Personalized service

---

## 🆘 **Support & Troubleshooting**

### **Common Issues**

**Database Connection Issues:**

```bash
npm run db:reset
```

**Build Errors:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use:**

```bash
npm run dev -- -p 3001
```

### **Getting Help**

- Check the console for error messages
- Ensure all dependencies are installed
- Verify Node.js version compatibility
- Check database file permissions

---

## 📄 **License**

This project is proprietary software. All rights reserved.

---

## 🎉 **Ready to Get Started?**

1. **Install the system** using the Quick Start guide above
2. **Set up your business** following the checklist
3. **Start processing transactions** and managing your business!

**Need help?** The system includes comprehensive error handling and user-friendly interfaces to guide you through setup and daily operations.

---

_This POS system is designed to grow with your business, providing professional-grade tools for efficient operations and revenue maximization._
