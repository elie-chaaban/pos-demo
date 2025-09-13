// Enchante by Remy Daher - POS System JavaScript
class POSSystem {
  constructor() {
    this.customers = this.loadData("customers") || [];
    this.employees = this.loadData("employees") || [];
    this.categories = this.loadData("categories") || [];
    this.items = this.loadData("items") || [];
    this.inventory = this.loadData("inventory") || [];
    this.sales = this.loadData("sales") || [];
    this.expenses = this.loadData("expenses") || [];
    this.cart = [];
    this.currentCustomer = null;

    // Inventory costing settings
    this.costingMethod = this.loadData("costingMethod") || "FIFO"; // FIFO or WeightedAverage
    this.inventoryBatches = this.loadData("inventoryBatches") || []; // Track batches with different costs

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.renderAll();
  }

  // Data Management
  loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get appropriate employee for service category
  getEmployeeForCategory(categoryId) {
    switch (categoryId) {
      case "cat1": // Hair Services
      case "cat2": // Hair Extensions
      case "cat3": // Hair Products
        return (
          this.employees.find((emp) => emp.role === "Hairdresser") ||
          this.employees[0]
        );
      case "cat4": // Nail Services
      case "cat5": // Nail Products
        return (
          this.employees.find((emp) => emp.role === "Nail Technician") ||
          this.employees[2]
        );
      case "cat6": // Face Treatments
        return (
          this.employees.find((emp) => emp.role === "Salon Owner") ||
          this.employees[1]
        );
      default:
        return this.employees[0]; // Default to first employee
    }
  }

  // Check if a category represents a service (no stock needed)
  isServiceCategory(categoryId) {
    return ["cat1", "cat2", "cat4", "cat6"].includes(categoryId);
  }

  // Check if a category represents a product (needs stock tracking)
  isProductCategory(categoryId) {
    return ["cat3", "cat5"].includes(categoryId);
  }

  // Inventory Costing Methods
  addInventoryBatch(itemId, quantity, unitCost, type = "Purchase") {
    const batch = {
      id: this.generateId(),
      itemId: itemId,
      quantity: quantity,
      unitCost: unitCost,
      type: type,
      date: new Date().toISOString(),
      remainingQuantity: quantity,
    };

    this.inventoryBatches.push(batch);
    this.saveData("inventoryBatches", this.inventoryBatches);
    return batch;
  }

  // Calculate cost of goods sold using FIFO method
  calculateCOGSFIFO(itemId, quantity) {
    const batches = this.inventoryBatches
      .filter((batch) => batch.itemId === itemId && batch.remainingQuantity > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest first

    let remainingQuantity = quantity;
    let totalCost = 0;
    const usedBatches = [];

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      const usedFromBatch = Math.min(
        remainingQuantity,
        batch.remainingQuantity
      );
      totalCost += usedFromBatch * batch.unitCost;
      batch.remainingQuantity -= usedFromBatch;
      remainingQuantity -= usedFromBatch;

      usedBatches.push({
        batchId: batch.id,
        quantity: usedFromBatch,
        unitCost: batch.unitCost,
        totalCost: usedFromBatch * batch.unitCost,
      });
    }

    this.saveData("inventoryBatches", this.inventoryBatches);
    return { totalCost, usedBatches };
  }

  // Calculate cost of goods sold using Weighted Average method
  calculateCOGSWeightedAverage(itemId, quantity) {
    const batches = this.inventoryBatches.filter(
      (batch) => batch.itemId === itemId && batch.remainingQuantity > 0
    );

    if (batches.length === 0) return { totalCost: 0, usedBatches: [] };

    // Calculate weighted average cost
    let totalValue = 0;
    let totalQuantity = 0;

    for (const batch of batches) {
      totalValue += batch.remainingQuantity * batch.unitCost;
      totalQuantity += batch.remainingQuantity;
    }

    const weightedAverageCost = totalValue / totalQuantity;
    const totalCost = quantity * weightedAverageCost;

    // Update remaining quantities proportionally
    const usedBatches = [];
    for (const batch of batches) {
      const proportion = batch.remainingQuantity / totalQuantity;
      const usedFromBatch = quantity * proportion;
      batch.remainingQuantity -= usedFromBatch;

      usedBatches.push({
        batchId: batch.id,
        quantity: usedFromBatch,
        unitCost: batch.unitCost,
        totalCost: usedFromBatch * batch.unitCost,
      });
    }

    this.saveData("inventoryBatches", this.inventoryBatches);
    return { totalCost, usedBatches };
  }

  // Get current average cost for an item
  getCurrentAverageCost(itemId) {
    const batches = this.inventoryBatches.filter(
      (batch) => batch.itemId === itemId && batch.remainingQuantity > 0
    );

    if (batches.length === 0) return 0;

    let totalValue = 0;
    let totalQuantity = 0;

    for (const batch of batches) {
      totalValue += batch.remainingQuantity * batch.unitCost;
      totalQuantity += batch.remainingQuantity;
    }

    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  }

  // Event Listeners
  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.showSection(e.target.dataset.section);
      });
    });

    // Modal
    document.getElementById("modal").addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal") ||
        e.target.classList.contains("modal-close")
      ) {
        this.hideModal();
      }
    });

    // POS Controls
    document
      .getElementById("clearCart")
      .addEventListener("click", () => this.clearCart());
    document
      .getElementById("checkout")
      .addEventListener("click", () => this.checkout());
    document
      .getElementById("itemSearch")
      .addEventListener("input", (e) => this.searchItems(e.target.value));
    document
      .getElementById("customerSelect")
      .addEventListener("change", (e) => {
        this.currentCustomer = e.target.value;
      });

    // Add buttons
    document
      .getElementById("addCustomer")
      .addEventListener("click", () => this.showCustomerModal());
    document
      .getElementById("addEmployee")
      .addEventListener("click", () => this.showEmployeeModal());
    document
      .getElementById("addItem")
      .addEventListener("click", () => this.showItemModal());
    document
      .getElementById("addInventory")
      .addEventListener("click", () => this.showInventoryModal());
    document
      .getElementById("addExpense")
      .addEventListener("click", () => this.showExpenseModal());
    document
      .getElementById("addCategory")
      .addEventListener("click", () => this.showCategoryModal());
    document
      .getElementById("generateReport")
      .addEventListener("click", () => this.generateReports());
    document
      .getElementById("testInvoice")
      .addEventListener("click", () => this.createTestInvoice());
    document
      .getElementById("saveSettings")
      .addEventListener("click", () => this.saveSettings());
  }

  // Navigation
  showSection(sectionId) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
    document
      .querySelector(`[data-section="${sectionId}"]`)
      .classList.add("active");

    this.renderAll();
  }

  // Modal Management
  showModal(title, content) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = content;
    document.getElementById("modal").style.display = "block";
  }

  hideModal() {
    document.getElementById("modal").style.display = "none";
  }

  // Initial Data Setup
  loadInitialData() {
    if (this.categories.length === 0) {
      this.categories = [
        {
          id: "cat1",
          name: "Hair Services",
          commissionRate: 70,
          description:
            "All hair services: haircut, styling, coloring, treatments, etc.",
          salonOwnerRate: 30,
        },
        {
          id: "cat2",
          name: "Hair Extensions",
          commissionRate: 80,
          description: "All types of hair extensions: sales, refill, or rent",
          salonOwnerRate: 20,
        },
        {
          id: "cat3",
          name: "Hair Products & Accessories",
          commissionRate: 95,
          description:
            "Shampoo, conditioners, hair masks, serums, accessories, etc.",
          salonOwnerRate: 5,
        },
        {
          id: "cat4",
          name: "Nail Services",
          description: "All nail services: manicure, pedicure, nail art, etc.",
          salonOwnerRate: 100,
        },
        {
          id: "cat5",
          name: "Nail Products",
          description:
            "Nail polish, nail art supplies, nail care products, etc.",
          salonOwnerRate: 100,
        },
        {
          id: "cat6",
          name: "Face Treatments",
          description: "Face masks, facial treatments, skincare services, etc.",
          salonOwnerRate: 100,
        },
      ];
      this.saveData("categories", this.categories);
    }

    // Initialize expense categories
    this.expenseCategories = this.loadData("expenseCategories") || [];
    if (this.expenseCategories.length === 0) {
      this.expenseCategories = [
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
      this.saveData("expenseCategories", this.expenseCategories);
    }

    if (this.employees.length === 0) {
      this.employees = [
        {
          id: "emp1",
          name: "Gilbert Atallah",
          email: "gilbert@salon.com",
          phone: "555-0101",
          role: "Hairdresser",
        },
        {
          id: "emp2",
          name: "elie cha",
          email: "elie@salon.com",
          phone: "555-0102",
          role: "Salon Owner",
        },
        {
          id: "emp3",
          name: "Sarah Johnson",
          email: "sarah@salon.com",
          phone: "555-0103",
          role: "Nail Technician",
        },
        {
          id: "emp4",
          name: "Maria Garcia",
          email: "maria@salon.com",
          phone: "555-0104",
          role: "Nail Technician",
        },
        {
          id: "emp5",
          name: "Lisa Chen",
          email: "lisa@salon.com",
          phone: "555-0105",
          role: "Nail Technician",
        },
        {
          id: "emp6",
          name: "Emma Wilson",
          email: "emma@salon.com",
          phone: "555-0106",
          role: "Nail Technician",
        },
      ];
      this.saveData("employees", this.employees);
    }

    if (this.customers.length === 0) {
      this.customers = [
        {
          id: "cust1",
          name: "Alice Brown",
          email: "alice@email.com",
          phone: "555-0201",
          address: "123 Main St",
        },
        {
          id: "cust2",
          name: "Bob Davis",
          email: "bob@email.com",
          phone: "555-0202",
          address: "456 Oak Ave",
        },
        {
          id: "cust3",
          name: "Carol White",
          email: "carol@email.com",
          phone: "555-0203",
          address: "789 Pine Rd",
        },
      ];
      this.saveData("customers", this.customers);
    }

    if (this.items.length === 0) {
      this.items = [
        // Hair Services (70% Gilbert, 30% Salon Owner)
        {
          id: "item1",
          name: "Haircut & Styling",
          categoryId: "cat1",
          price: 45.0,
          stock: 999,
          description: "Professional haircut and styling service",
        },
        {
          id: "item2",
          name: "Full Color Treatment",
          categoryId: "cat1",
          price: 120.0,
          stock: 999,
          description: "Complete hair coloring service",
        },
        {
          id: "item3",
          name: "Highlights/Lowlights",
          categoryId: "cat1",
          price: 85.0,
          stock: 999,
          description: "Professional highlighting or lowlighting service",
        },
        {
          id: "item4",
          name: "Keratin Treatment",
          categoryId: "cat1",
          price: 150.0,
          stock: 999,
          description: "Professional keratin smoothing treatment",
        },
        {
          id: "item5",
          name: "Bridal Hairstyle",
          categoryId: "cat1",
          price: 200.0,
          stock: 999,
          description: "Special bridal hairstyling service",
        },
        {
          id: "item6",
          name: "Hair Treatment",
          categoryId: "cat1",
          price: 65.0,
          stock: 999,
          description: "Deep conditioning hair treatment",
        },

        // Hair Extensions (80% Gilbert, 20% Salon Owner)
        {
          id: "item7",
          name: "Hair Extensions (Human Hair)",
          categoryId: "cat2",
          price: 300.0,
          stock: 20,
          description: "High-quality human hair extensions",
        },
        {
          id: "item8",
          name: "Extension Refill",
          categoryId: "cat2",
          price: 80.0,
          stock: 999,
          description: "Hair extension maintenance and refill",
        },

        // Hair Products (95% Gilbert, 5% Salon Owner)
        {
          id: "item9",
          name: "Premium Shampoo",
          categoryId: "cat3",
          price: 25.0,
          stock: 50,
          description: "Professional salon shampoo",
        },
        {
          id: "item10",
          name: "Hair Serum",
          categoryId: "cat3",
          price: 35.0,
          stock: 30,
          description: "Professional hair serum for styling",
        },
        {
          id: "item11",
          name: "Hair Mask",
          categoryId: "cat3",
          price: 28.0,
          stock: 25,
          description: "Deep conditioning hair mask",
        },

        // Nail Services (100% Salon Owner)
        {
          id: "item12",
          name: "Manicure",
          categoryId: "cat4",
          price: 35.0,
          stock: 999,
          description: "Professional manicure service",
        },
        {
          id: "item13",
          name: "Pedicure",
          categoryId: "cat4",
          price: 45.0,
          stock: 999,
          description: "Professional pedicure service",
        },
        {
          id: "item14",
          name: "Gel Manicure",
          categoryId: "cat4",
          price: 50.0,
          stock: 999,
          description: "Long-lasting gel manicure",
        },
        {
          id: "item15",
          name: "Nail Art",
          categoryId: "cat4",
          price: 25.0,
          stock: 999,
          description: "Custom nail art design",
        },

        // Nail Products (100% Salon Owner)
        {
          id: "item16",
          name: "Nail Polish",
          categoryId: "cat5",
          price: 12.0,
          stock: 100,
          description: "Professional nail polish",
        },
        {
          id: "item17",
          name: "Gel Polish",
          categoryId: "cat5",
          price: 18.0,
          stock: 80,
          description: "Long-lasting gel nail polish",
        },
        {
          id: "item18",
          name: "Nail Art Kit",
          categoryId: "cat5",
          price: 35.0,
          stock: 20,
          description: "Complete nail art kit with tools",
        },

        // Face Treatments (100% Salon Owner)
        {
          id: "item19",
          name: "Hydrating Face Mask",
          categoryId: "cat6",
          price: 40.0,
          stock: 999,
          description: "Professional hydrating facial mask treatment",
        },
        {
          id: "item20",
          name: "Anti-Aging Face Treatment",
          categoryId: "cat6",
          price: 75.0,
          stock: 999,
          description: "Professional anti-aging facial treatment",
        },
        {
          id: "item21",
          name: "Face Mask Product",
          categoryId: "cat6",
          price: 22.0,
          stock: 40,
          description: "Take-home face mask product",
        },
      ];
      this.saveData("items", this.items);
    }
  }

  // Rendering
  renderAll() {
    this.renderCustomers();
    this.renderEmployees();
    this.renderItems();
    this.renderInventory();
    this.renderExpenses();
    this.renderCategories();
    this.renderPOS();
    this.renderSettings();
    this.generateReports();
  }

  renderCustomers() {
    const tbody = document.getElementById("customersTable");
    tbody.innerHTML = this.customers
      .map(
        (customer) => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.address}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="pos.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="pos.deleteCustomer('${customer.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderEmployees() {
    const tbody = document.getElementById("employeesTable");
    tbody.innerHTML = this.employees
      .map(
        (employee) => `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.phone}</td>
                <td>${employee.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="pos.editEmployee('${employee.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="pos.deleteEmployee('${employee.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderItems() {
    const tbody = document.getElementById("itemsTable");
    tbody.innerHTML = this.items
      .map((item) => {
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        const isService = this.isServiceCategory(item.categoryId);

        const averageCost = isService
          ? "N/A"
          : item.averageCost
          ? `$${item.averageCost.toFixed(2)}`
          : "N/A";

        return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${category ? category.name : "N/A"}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${isService ? "N/A" : item.stock}</td>
                    <td>${averageCost}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="pos.editItem('${
                          item.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="pos.deleteItem('${
                          item.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  renderInventory() {
    const tbody = document.getElementById("inventoryTable");
    tbody.innerHTML = this.inventory
      .map((record) => {
        const item = this.items.find((i) => i.id === record.itemId);
        // Total cost should always be positive (absolute quantity * unit cost)
        const totalCost = Math.abs(record.quantity) * record.unitCost;

        // Show COGS information if available
        const cogsInfo = record.cogsTotal
          ? `<br><small style="color: #28a745;">COGS: $${record.cogsTotal.toFixed(
              2
            )}</small>`
          : "";

        return `
                <tr>
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${item ? item.name : "Unknown Item"}</td>
                    <td>${record.type}</td>
                    <td>${record.quantity}</td>
                    <td>$${record.unitCost.toFixed(2)}</td>
                    <td>$${totalCost.toFixed(2)}${cogsInfo}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="pos.deleteInventoryRecord('${
                          record.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  renderExpenses() {
    const tbody = document.getElementById("expensesTable");
    tbody.innerHTML = this.expenses
      .map((expense) => {
        const category = this.expenseCategories.find(
          (cat) => cat.id === expense.categoryId
        );
        return `
                <tr>
                    <td>${new Date(expense.date).toLocaleDateString()}</td>
                    <td>${expense.description}</td>
                    <td>${category ? category.name : "Unknown"}</td>
                    <td>$${expense.amount.toFixed(2)}</td>
                    <td>${expense.paymentMethod}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="pos.editExpense('${
                          expense.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="pos.deleteExpense('${
                          expense.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  renderCategories() {
    const tbody = document.getElementById("categoriesTable");
    tbody.innerHTML = this.categories
      .map(
        (category) => `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.commissionRate}%</td>
                <td>${category.salonOwnerRate || 0}%</td>
                <td>${category.description}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="pos.editCategory('${
                      category.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="pos.deleteCategory('${
                      category.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderPOS() {
    this.renderItemsGrid();
    this.renderCart();
    this.renderCustomerSelect();
  }

  renderItemsGrid() {
    const grid = document.getElementById("itemsGrid");
    grid.innerHTML = this.items
      .map((item) => {
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        const isService = this.isServiceCategory(item.categoryId);

        return `
                <div class="item-card" onclick="pos.addToCart('${item.id}')">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price.toFixed(2)}</div>
                    <div class="stock">${
                      isService ? "Service" : `Stock: ${item.stock}`
                    }</div>
                    <div class="category">${
                      category ? category.name : "N/A"
                    }</div>
                </div>
            `;
      })
      .join("");
  }

  renderCart() {
    const cartItems = document.getElementById("cartItems");
    if (this.cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">No items in cart</p>';
    } else {
      cartItems.innerHTML = this.cart
        .map((item) => {
          const itemData = this.items.find((i) => i.id === item.id);
          const category = this.categories.find(
            (cat) => cat.id === itemData.categoryId
          );

          // Get appropriate employees for this category
          let availableEmployees = [];
          if (
            category.id === "cat1" ||
            category.id === "cat2" ||
            category.id === "cat3"
          ) {
            // Hair services - show hairdressers
            availableEmployees = this.employees.filter(
              (emp) => emp.role === "Hairdresser"
            );
          } else if (category.id === "cat4" || category.id === "cat5") {
            // Nail services - show nail technicians
            availableEmployees = this.employees.filter(
              (emp) => emp.role === "Nail Technician"
            );
          } else if (category.id === "cat6") {
            // Face treatments - show salon owner or anyone
            availableEmployees = this.employees.filter(
              (emp) => emp.role === "Salon Owner"
            );
          }

          // If no specific employees found, show all
          if (availableEmployees.length === 0) {
            availableEmployees = this.employees;
          }

          const employeeOptions = availableEmployees
            .map(
              (emp) =>
                `<option value="${emp.id}" ${
                  item.employeeId === emp.id ? "selected" : ""
                }>${emp.name}</option>`
            )
            .join("");

          return `
                     <div class="cart-item">
                         <div class="cart-item-info">
                             <div class="cart-item-name">${itemData.name}</div>
                             <div class="cart-item-price">$${itemData.price.toFixed(
                               2
                             )} each</div>
                             <div class="cart-item-employee">
                                 <label>Employee:</label>
                                 <select class="employee-select" onchange="pos.setItemEmployee('${
                                   item.id
                                 }', this.value)">
                                     ${employeeOptions}
                                 </select>
                             </div>
                         </div>
                         <div class="cart-item-controls">
                             <button class="quantity-btn" onclick="pos.updateQuantity('${
                               item.id
                             }', -1)">-</button>
                             <input type="number" class="quantity-input" value="${
                               item.quantity
                             }" 
                                    onchange="pos.setQuantity('${
                                      item.id
                                    }', this.value)">
                             <button class="quantity-btn" onclick="pos.updateQuantity('${
                               item.id
                             }', 1)">+</button>
                             <button class="btn btn-sm btn-danger" onclick="pos.removeFromCart('${
                               item.id
                             }')">
                                 <i class="fas fa-trash"></i>
                             </button>
                         </div>
                     </div>
                 `;
        })
        .join("");
    }
    this.updateCartSummary();
  }

  renderCustomerSelect() {
    const select = document.getElementById("customerSelect");
    select.innerHTML =
      '<option value="">Select Customer</option>' +
      this.customers
        .map((cust) => `<option value="${cust.id}">${cust.name}</option>`)
        .join("");
  }

  updateCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => {
      const itemData = this.items.find((i) => i.id === item.id);
      return sum + itemData.price * item.quantity;
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
  }

  // POS Functions
  addToCart(itemId) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) {
      alert("Item not found!");
      return;
    }

    // Check stock only for products, not services
    if (this.isProductCategory(item.categoryId)) {
      if (item.stock <= 0) {
        alert("Item out of stock!");
        return;
      }
    }

    const existingItem = this.cart.find((cartItem) => cartItem.id === itemId);
    if (existingItem) {
      // For products, check stock limit
      if (this.isProductCategory(item.categoryId)) {
        if (existingItem.quantity < item.stock) {
          existingItem.quantity++;
        } else {
          alert("Not enough stock available!");
          return;
        }
      } else {
        // For services, no stock limit
        existingItem.quantity++;
      }
    } else {
      // Set default employee based on category
      const defaultEmployee = this.getEmployeeForCategory(item.categoryId);
      this.cart.push({
        id: itemId,
        quantity: 1,
        employeeId: defaultEmployee.id,
      });
    }

    this.renderCart();
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter((item) => item.id !== itemId);
    this.renderCart();
  }

  setItemEmployee(itemId, employeeId) {
    const cartItem = this.cart.find((item) => item.id === itemId);
    if (cartItem) {
      cartItem.employeeId = employeeId;
      this.renderCart();
    }
  }

  updateQuantity(itemId, change) {
    const cartItem = this.cart.find((item) => item.id === itemId);
    if (cartItem) {
      const item = this.items.find((i) => i.id === itemId);
      const newQuantity = cartItem.quantity + change;

      if (newQuantity <= 0) {
        this.removeFromCart(itemId);
      } else if (newQuantity <= item.stock) {
        cartItem.quantity = newQuantity;
        this.renderCart();
      } else {
        alert("Not enough stock available!");
      }
    }
  }

  setQuantity(itemId, quantity) {
    const cartItem = this.cart.find((item) => item.id === itemId);
    const item = this.items.find((i) => i.id === itemId);
    const newQuantity = parseInt(quantity);

    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
    } else if (newQuantity <= item.stock) {
      cartItem.quantity = newQuantity;
      this.renderCart();
    } else {
      alert("Not enough stock available!");
      cartItem.quantity = item.stock;
      this.renderCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.renderCart();
  }

  searchItems(query) {
    const filteredItems = this.items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    const grid = document.getElementById("itemsGrid");
    grid.innerHTML = filteredItems
      .map((item) => {
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        return `
                <div class="item-card" onclick="pos.addToCart('${item.id}')">
                    <h4>${item.name}</h4>
                    <div class="price">$${item.price.toFixed(2)}</div>
                    <div class="stock">Stock: ${item.stock}</div>
                    <div class="category">${
                      category ? category.name : "N/A"
                    }</div>
                </div>
            `;
      })
      .join("");
  }

  checkout() {
    if (this.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Calculate totals
    const subtotal = this.cart.reduce((sum, item) => {
      const itemData = this.items.find((i) => i.id === item.id);
      return sum + itemData.price * item.quantity;
    }, 0);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Create sale record with employee assignment per item
    const sale = {
      id: this.generateId(),
      date: new Date().toISOString(),
      customerId: this.currentCustomer || null,
      items: this.cart.map((cartItem) => {
        const item = this.items.find((i) => i.id === cartItem.id);
        const employee = this.employees.find(
          (emp) => emp.id === cartItem.employeeId
        );
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        const itemTotal = item.price * cartItem.quantity;

        return {
          itemId: cartItem.id,
          name: item.name,
          quantity: cartItem.quantity,
          price: item.price,
          total: itemTotal,
          employeeId: employee.id,
          employeeName: employee.name,
          categoryId: item.categoryId,
          commissionRate: category.commissionRate,
          salonOwnerRate: category.salonOwnerRate,
          commissionAmount: (itemTotal * category.commissionRate) / 100,
          salonOwnerAmount: (itemTotal * category.salonOwnerRate) / 100,
        };
      }),
      subtotal: subtotal,
      tax: tax,
      total: total,
    };

    // Update stock only for products
    this.cart.forEach((cartItem) => {
      const item = this.items.find((i) => i.id === cartItem.id);

      // Only update stock for products, not services
      if (this.isProductCategory(item.categoryId)) {
        item.stock -= cartItem.quantity;

        // Calculate cost of goods sold
        const cogsResult =
          this.costingMethod === "FIFO"
            ? this.calculateCOGSFIFO(cartItem.id, cartItem.quantity)
            : this.calculateCOGSWeightedAverage(cartItem.id, cartItem.quantity);

        // Add inventory record for sale (only for products)
        this.inventory.push({
          id: this.generateId(),
          date: new Date().toISOString(),
          itemId: cartItem.id,
          type: "Usage",
          quantity: cartItem.quantity,
          unitCost: item.price,
          saleId: sale.id,
          cogsTotal: cogsResult.totalCost,
          usedBatches: cogsResult.usedBatches,
        });

        // Update item's average cost
        item.averageCost = this.getCurrentAverageCost(cartItem.id);
      }
    });

    // Calculate commission and revenue sharing per employee
    let totalCommission = 0;
    let totalSalonOwnerRevenue = 0;
    const employeeCommissions = {};

    sale.items.forEach((saleItem) => {
      // Use stored commission amounts
      const employeeCommission = saleItem.commissionAmount;
      const salonOwnerRevenue = saleItem.salonOwnerAmount;
      totalCommission += employeeCommission;
      totalSalonOwnerRevenue += salonOwnerRevenue;

      // Track commission per employee
      if (!employeeCommissions[saleItem.employeeId]) {
        employeeCommissions[saleItem.employeeId] = {
          name: saleItem.employeeName,
          commission: 0,
        };
      }
      employeeCommissions[saleItem.employeeId].commission += employeeCommission;
    });

    // Save data
    this.sales.push(sale);
    this.saveData("sales", this.sales);
    this.saveData("items", this.items);
    this.saveData("inventory", this.inventory);

    // Show success message with revenue sharing breakdown
    let employeeBreakdown = "";
    Object.values(employeeCommissions).forEach((emp) => {
      if (emp.commission > 0) {
        employeeBreakdown += `\n${emp.name}: $${emp.commission.toFixed(2)}`;
      }
    });

    alert(
      `Sale completed successfully!\nTotal: $${total.toFixed(
        2
      )}\n\nRevenue Sharing:${employeeBreakdown}\n\nTotal Employee Commissions: $${totalCommission.toFixed(
        2
      )}\nSalon Owner Revenue: $${totalSalonOwnerRevenue.toFixed(2)}`
    );

    // Clear cart and reset
    this.clearCart();
    this.currentCustomer = null;
    document.getElementById("customerSelect").value = "";

    // Refresh displays
    this.renderAll();
  }

  // Customer Management
  showCustomerModal(customerId = null) {
    const customer = customerId
      ? this.customers.find((c) => c.id === customerId)
      : null;
    const title = customer ? "Edit Customer" : "Add Customer";

    const content = `
            <form id="customerForm">
                <div class="form-group">
                    <label for="customerName">Name:</label>
                    <input type="text" id="customerName" class="form-input" value="${
                      customer ? customer.name : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email:</label>
                    <input type="email" id="customerEmail" class="form-input" value="${
                      customer ? customer.email : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone:</label>
                    <input type="tel" id="customerPhone" class="form-input" value="${
                      customer ? customer.phone : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="customerAddress">Address:</label>
                    <input type="text" id="customerAddress" class="form-input" value="${
                      customer ? customer.address : ""
                    }" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">${
                      customer ? "Update" : "Add"
                    } Customer</button>
                    <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                </div>
            </form>
        `;

    this.showModal(title, content);

    document.getElementById("customerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCustomer(customerId);
    });
  }

  saveCustomer(customerId) {
    const name = document.getElementById("customerName").value;
    const email = document.getElementById("customerEmail").value;
    const phone = document.getElementById("customerPhone").value;
    const address = document.getElementById("customerAddress").value;

    if (customerId) {
      const customer = this.customers.find((c) => c.id === customerId);
      customer.name = name;
      customer.email = email;
      customer.phone = phone;
      customer.address = address;
    } else {
      this.customers.push({
        id: this.generateId(),
        name,
        email,
        phone,
        address,
      });
    }

    this.saveData("customers", this.customers);
    this.renderCustomers();
    this.renderCustomerSelect();
    this.hideModal();
  }

  editCustomer(customerId) {
    this.showCustomerModal(customerId);
  }

  deleteCustomer(customerId) {
    if (confirm("Are you sure you want to delete this customer?")) {
      this.customers = this.customers.filter((c) => c.id !== customerId);
      this.saveData("customers", this.customers);
      this.renderCustomers();
      this.renderCustomerSelect();
    }
  }

  // Employee Management
  showEmployeeModal(employeeId = null) {
    const employee = employeeId
      ? this.employees.find((e) => e.id === employeeId)
      : null;
    const title = employee ? "Edit Employee" : "Add Employee";

    const content = `
            <form id="employeeForm">
                <div class="form-group">
                    <label for="employeeName">Name:</label>
                    <input type="text" id="employeeName" class="form-input" value="${
                      employee ? employee.name : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="employeeEmail">Email:</label>
                    <input type="email" id="employeeEmail" class="form-input" value="${
                      employee ? employee.email : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="employeePhone">Phone:</label>
                    <input type="tel" id="employeePhone" class="form-input" value="${
                      employee ? employee.phone : ""
                    }" required>
                </div>
                 <div class="form-group">
                     <label for="employeeRole">Role:</label>
                     <select id="employeeRole" class="form-select" required>
                         <option value="Hairdresser" ${
                           employee && employee.role === "Hairdresser"
                             ? "selected"
                             : ""
                         }>Hairdresser</option>
                         <option value="Salon Owner" ${
                           employee && employee.role === "Salon Owner"
                             ? "selected"
                             : ""
                         }>Salon Owner</option>
                         <option value="Nail Technician" ${
                           employee && employee.role === "Nail Technician"
                             ? "selected"
                             : ""
                         }>Nail Technician</option>
                         <option value="Receptionist" ${
                           employee && employee.role === "Receptionist"
                             ? "selected"
                             : ""
                         }>Receptionist</option>
                     </select>
                 </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">${
                      employee ? "Update" : "Add"
                    } Employee</button>
                    <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                </div>
            </form>
        `;

    this.showModal(title, content);

    document.getElementById("employeeForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveEmployee(employeeId);
    });
  }

  saveEmployee(employeeId) {
    const name = document.getElementById("employeeName").value;
    const email = document.getElementById("employeeEmail").value;
    const phone = document.getElementById("employeePhone").value;
    const role = document.getElementById("employeeRole").value;

    if (employeeId) {
      const employee = this.employees.find((e) => e.id === employeeId);
      employee.name = name;
      employee.email = email;
      employee.phone = phone;
      employee.role = role;
    } else {
      this.employees.push({
        id: this.generateId(),
        name,
        email,
        phone,
        role,
      });
    }

    this.saveData("employees", this.employees);
    this.renderEmployees();
    this.renderEmployeeSelect();
    this.hideModal();
  }

  editEmployee(employeeId) {
    this.showEmployeeModal(employeeId);
  }

  deleteEmployee(employeeId) {
    if (confirm("Are you sure you want to delete this employee?")) {
      this.employees = this.employees.filter((e) => e.id !== employeeId);
      this.saveData("employees", this.employees);
      this.renderEmployees();
      this.renderEmployeeSelect();
    }
  }

  // Category Management
  showCategoryModal(categoryId = null) {
    const category = categoryId
      ? this.categories.find((c) => c.id === categoryId)
      : null;
    const title = category ? "Edit Category" : "Add Category";

    const content = `
             <form id="categoryForm">
                 <div class="form-group">
                     <label for="categoryName">Name:</label>
                     <input type="text" id="categoryName" class="form-input" value="${
                       category ? category.name : ""
                     }" required>
                 </div>
                 <div class="form-group">
                     <label for="categoryCommission">Employee Commission Rate (%):</label>
                     <input type="number" id="categoryCommission" class="form-input" value="${
                       category ? category.commissionRate : 0
                     }" min="0" max="100" step="0.1" required>
                 </div>
                 <div class="form-group">
                     <label for="categorySalonOwner">Salon Owner Rate (%):</label>
                     <input type="number" id="categorySalonOwner" class="form-input" value="${
                       category ? category.salonOwnerRate || 0 : 0
                     }" min="0" max="100" step="0.1" required>
                 </div>
                 <div class="form-group">
                     <label for="categoryDescription">Description:</label>
                     <textarea id="categoryDescription" class="form-input" rows="3" required>${
                       category ? category.description : ""
                     }</textarea>
                 </div>
                 <div class="form-group">
                     <button type="submit" class="btn btn-primary">${
                       category ? "Update" : "Add"
                     } Category</button>
                     <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                 </div>
             </form>
         `;

    this.showModal(title, content);

    document.getElementById("categoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCategory(categoryId);
    });
  }

  saveCategory(categoryId) {
    const name = document.getElementById("categoryName").value;
    const commissionRate = parseFloat(
      document.getElementById("categoryCommission").value
    );
    const salonOwnerRate = parseFloat(
      document.getElementById("categorySalonOwner").value
    );
    const description = document.getElementById("categoryDescription").value;

    if (categoryId) {
      const category = this.categories.find((c) => c.id === categoryId);
      category.name = name;
      category.commissionRate = commissionRate;
      category.salonOwnerRate = salonOwnerRate;
      category.description = description;
    } else {
      this.categories.push({
        id: this.generateId(),
        name,
        commissionRate,
        salonOwnerRate,
        description,
      });
    }

    this.saveData("categories", this.categories);
    this.renderCategories();
    this.hideModal();
  }

  editCategory(categoryId) {
    this.showCategoryModal(categoryId);
  }

  deleteCategory(categoryId) {
    if (confirm("Are you sure you want to delete this category?")) {
      this.categories = this.categories.filter((c) => c.id !== categoryId);
      this.saveData("categories", this.categories);
      this.renderCategories();
    }
  }

  // Item Management
  showItemModal(itemId = null) {
    const item = itemId ? this.items.find((i) => i.id === itemId) : null;
    const title = item ? "Edit Item" : "Add Item";

    const content = `
            <form id="itemForm">
                <div class="form-group">
                    <label for="itemName">Name:</label>
                    <input type="text" id="itemName" class="form-input" value="${
                      item ? item.name : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="itemCategory">Category:</label>
                    <select id="itemCategory" class="form-select" required>
                        <option value="">Select Category</option>
                        ${this.categories
                          .map(
                            (cat) =>
                              `<option value="${cat.id}" ${
                                item && item.categoryId === cat.id
                                  ? "selected"
                                  : ""
                              }>${cat.name}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemPrice">Price:</label>
                    <input type="number" id="itemPrice" class="form-input" value="${
                      item ? item.price : ""
                    }" min="0" step="0.01" required>
                </div>
                <div class="form-group" id="stockField">
                    <label for="itemStock">Stock:</label>
                    <input type="number" id="itemStock" class="form-input" value="${
                      item ? item.stock : ""
                    }" min="0" required>
                    <small class="form-text">Only required for products, not services</small>
                </div>
                <div class="form-group">
                    <label for="itemDescription">Description:</label>
                    <textarea id="itemDescription" class="form-input" rows="3">${
                      item ? item.description : ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">${
                      item ? "Update" : "Add"
                    } Item</button>
                    <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                </div>
            </form>
        `;

    this.showModal(title, content);

    // Add event listener for category change to show/hide stock field
    document.getElementById("itemCategory").addEventListener("change", (e) => {
      const categoryId = e.target.value;
      const stockField = document.getElementById("stockField");
      const stockInput = document.getElementById("itemStock");

      if (this.isServiceCategory(categoryId)) {
        stockField.style.display = "none";
        stockInput.required = false;
        stockInput.value = 0; // Services don't need stock
      } else {
        stockField.style.display = "block";
        stockInput.required = true;
      }
    });

    // Set initial state based on current category
    const currentCategory = document.getElementById("itemCategory").value;
    if (currentCategory && this.isServiceCategory(currentCategory)) {
      document.getElementById("stockField").style.display = "none";
      document.getElementById("itemStock").required = false;
    }

    document.getElementById("itemForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveItem(itemId);
    });
  }

  saveItem(itemId) {
    const name = document.getElementById("itemName").value;
    const categoryId = document.getElementById("itemCategory").value;
    const price = parseFloat(document.getElementById("itemPrice").value);
    const stockInput = document.getElementById("itemStock");
    const stock = this.isServiceCategory(categoryId)
      ? 0
      : parseInt(stockInput.value);
    const description = document.getElementById("itemDescription").value;

    if (itemId) {
      const item = this.items.find((i) => i.id === itemId);
      item.name = name;
      item.categoryId = categoryId;
      item.price = price;
      item.stock = stock;
      item.description = description;
    } else {
      this.items.push({
        id: this.generateId(),
        name,
        categoryId,
        price,
        stock,
        description,
      });
    }

    this.saveData("items", this.items);
    this.renderItems();
    this.renderItemsGrid();
    this.hideModal();
  }

  editItem(itemId) {
    this.showItemModal(itemId);
  }

  deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
      this.items = this.items.filter((i) => i.id !== itemId);
      this.saveData("items", this.items);
      this.renderItems();
      this.renderItemsGrid();
    }
  }

  // Inventory Management
  showInventoryModal() {
    const content = `
            <form id="inventoryForm">
                <div class="form-group">
                    <label for="inventoryItem">Item:</label>
                    <select id="inventoryItem" class="form-select" required>
                        <option value="">Select Item</option>
                        ${this.items
                          .filter((item) =>
                            this.isProductCategory(item.categoryId)
                          )
                          .map(
                            (item) =>
                              `<option value="${item.id}">${item.name}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="inventoryType">Type:</label>
                    <select id="inventoryType" class="form-select" required>
                        <option value="Purchase">Purchase (Add Stock)</option>
                        <option value="Usage">Usage (Remove Stock)</option>
                        <option value="Return">Return (Add Stock)</option>
                        <option value="Adjustment">Adjustment (Stock Correction)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="inventoryQuantity">Quantity:</label>
                    <input type="number" id="inventoryQuantity" class="form-input" required>
                    <small class="form-text">Enter quantity (type determines if it adds or removes stock)</small>
                </div>
                <div class="form-group">
                    <label for="inventoryUnitCost">Unit Cost:</label>
                    <input type="number" id="inventoryUnitCost" class="form-input" min="0" step="0.01" required>
                    <small class="form-text">Cost per unit (what you paid for it)</small>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Add to Inventory</button>
                    <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                </div>
            </form>
        `;

    this.showModal("Add Inventory Record", content);

    document.getElementById("inventoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveInventoryRecord();
    });
  }

  saveInventoryRecord() {
    const itemId = document.getElementById("inventoryItem").value;
    const type = document.getElementById("inventoryType").value;
    const quantity = parseInt(
      document.getElementById("inventoryQuantity").value
    );
    const unitCost = parseFloat(
      document.getElementById("inventoryUnitCost").value
    );

    // Add inventory record
    this.inventory.push({
      id: this.generateId(),
      date: new Date().toISOString(),
      itemId,
      type,
      quantity,
      unitCost,
    });

    // Update item stock and costing
    const item = this.items.find((i) => i.id === itemId);
    if (type === "Purchase" || type === "Return") {
      // Always add stock for purchases and returns
      item.stock += Math.abs(quantity);

      // Add to inventory batches for costing
      this.addInventoryBatch(itemId, Math.abs(quantity), unitCost, type);

      // Update item's average cost
      item.averageCost = this.getCurrentAverageCost(itemId);
    } else if (type === "Usage") {
      // Always remove stock for usage
      item.stock -= Math.abs(quantity);

      // Calculate cost of goods sold
      const cogsResult =
        this.costingMethod === "FIFO"
          ? this.calculateCOGSFIFO(itemId, Math.abs(quantity))
          : this.calculateCOGSWeightedAverage(itemId, Math.abs(quantity));

      // Update item's average cost
      item.averageCost = this.getCurrentAverageCost(itemId);

      // Store COGS information in inventory record
      const lastRecord = this.inventory[this.inventory.length - 1];
      lastRecord.cogsTotal = cogsResult.totalCost;
      lastRecord.usedBatches = cogsResult.usedBatches;
    } else if (type === "Adjustment") {
      // Can be positive or negative for stock corrections
      item.stock += quantity;

      if (quantity > 0) {
        // Adding stock - treat as purchase
        this.addInventoryBatch(itemId, quantity, unitCost, type);
      }
      // For negative adjustments, we don't track COGS as it's not a sale
    }

    this.saveData("inventory", this.inventory);
    this.saveData("items", this.items);
    this.renderInventory();
    this.renderItems();
    this.renderItemsGrid();
    this.hideModal();
  }

  deleteInventoryRecord(recordId) {
    if (confirm("Are you sure you want to delete this inventory record?")) {
      this.inventory = this.inventory.filter(
        (record) => record.id !== recordId
      );
      this.saveData("inventory", this.inventory);
      this.renderInventory();
    }
  }

  // Expense Management
  showExpenseModal(expenseId = null) {
    const expense = expenseId
      ? this.expenses.find((e) => e.id === expenseId)
      : null;
    const title = expense ? "Edit Expense" : "Add Expense";

    const content = `
            <form id="expenseForm">
                <div class="form-group">
                    <label for="expenseDate">Date:</label>
                    <input type="date" id="expenseDate" class="form-input" value="${
                      expense
                        ? expense.date.split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }" required>
                </div>
                <div class="form-group">
                    <label for="expenseDescription">Description:</label>
                    <input type="text" id="expenseDescription" class="form-input" value="${
                      expense ? expense.description : ""
                    }" required>
                </div>
                <div class="form-group">
                    <label for="expenseCategory">Category:</label>
                    <select id="expenseCategory" class="form-select" required>
                        <option value="">Select Category</option>
                        ${this.expenseCategories
                          .map(
                            (cat) =>
                              `<option value="${cat.id}" ${
                                expense && expense.categoryId === cat.id
                                  ? "selected"
                                  : ""
                              }>${cat.name}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="expenseAmount">Amount:</label>
                    <input type="number" id="expenseAmount" class="form-input" value="${
                      expense ? expense.amount : ""
                    }" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="expensePaymentMethod">Payment Method:</label>
                    <select id="expensePaymentMethod" class="form-select" required>
                        <option value="">Select Payment Method</option>
                        <option value="Cash" ${
                          expense && expense.paymentMethod === "Cash"
                            ? "selected"
                            : ""
                        }>Cash</option>
                        <option value="Credit Card" ${
                          expense && expense.paymentMethod === "Credit Card"
                            ? "selected"
                            : ""
                        }>Credit Card</option>
                        <option value="Debit Card" ${
                          expense && expense.paymentMethod === "Debit Card"
                            ? "selected"
                            : ""
                        }>Debit Card</option>
                        <option value="Bank Transfer" ${
                          expense && expense.paymentMethod === "Bank Transfer"
                            ? "selected"
                            : ""
                        }>Bank Transfer</option>
                        <option value="Check" ${
                          expense && expense.paymentMethod === "Check"
                            ? "selected"
                            : ""
                        }>Check</option>
                        <option value="Other" ${
                          expense && expense.paymentMethod === "Other"
                            ? "selected"
                            : ""
                        }>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="expenseNotes">Notes:</label>
                    <textarea id="expenseNotes" class="form-input" rows="3">${
                      expense ? expense.notes || "" : ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">${
                      expense ? "Update" : "Add"
                    } Expense</button>
                    <button type="button" class="btn btn-secondary" onclick="pos.hideModal()">Cancel</button>
                </div>
            </form>
        `;

    this.showModal(title, content);

    document.getElementById("expenseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveExpense(expenseId);
    });
  }

  saveExpense(expenseId) {
    const date = document.getElementById("expenseDate").value;
    const description = document.getElementById("expenseDescription").value;
    const categoryId = document.getElementById("expenseCategory").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const paymentMethod = document.getElementById("expensePaymentMethod").value;
    const notes = document.getElementById("expenseNotes").value;

    if (expenseId) {
      const expense = this.expenses.find((e) => e.id === expenseId);
      expense.date = date;
      expense.description = description;
      expense.categoryId = categoryId;
      expense.amount = amount;
      expense.paymentMethod = paymentMethod;
      expense.notes = notes;
    } else {
      this.expenses.push({
        id: this.generateId(),
        date: date,
        description: description,
        categoryId: categoryId,
        amount: amount,
        paymentMethod: paymentMethod,
        notes: notes,
      });
    }

    this.saveData("expenses", this.expenses);
    this.renderExpenses();
    this.hideModal();
  }

  editExpense(expenseId) {
    this.showExpenseModal(expenseId);
  }

  deleteExpense(expenseId) {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.expenses = this.expenses.filter((e) => e.id !== expenseId);
      this.saveData("expenses", this.expenses);
      this.renderExpenses();
    }
  }

  // Reporting Functions
  generateReports() {
    this.generateTodayReport();
    this.generateMonthReport();
    this.generateIndividualEmployeeReports();
    this.generateCostAnalysisReport();
    this.generateBatchTrackingReport();
    this.generateExpensesReport();
  }

  generateTodayReport() {
    const today = new Date().toDateString();
    const todaySales = this.sales.filter(
      (sale) => new Date(sale.date).toDateString() === today
    );

    let totalRevenue = 0;
    let totalEmployeeCommission = 0;
    let totalSalonOwnerRevenue = 0;

    todaySales.forEach((sale) => {
      totalRevenue += sale.total;

      sale.items.forEach((saleItem) => {
        // Use stored commission amounts (fallback to calculated if not stored)
        const employeeCommission =
          saleItem.commissionAmount ??
          (saleItem.total *
            (this.categories.find((cat) => cat.id === saleItem.categoryId)
              ?.commissionRate || 0)) /
            100;
        const salonOwnerRevenue =
          saleItem.salonOwnerAmount ??
          (saleItem.total *
            (this.categories.find((cat) => cat.id === saleItem.categoryId)
              ?.salonOwnerRate || 0)) /
            100;
        totalEmployeeCommission += employeeCommission;
        totalSalonOwnerRevenue += salonOwnerRevenue;
      });
    });

    const reportContent = document.getElementById("todayReport");
    reportContent.innerHTML = `
      <div class="report-row">
        <span>Total Sales:</span>
        <span>$${totalRevenue.toFixed(2)}</span>
      </div>
      <div class="report-row">
        <span>Employee Commissions:</span>
        <span>$${totalEmployeeCommission.toFixed(2)}</span>
      </div>
      <div class="report-row">
        <span>Salon Owner Revenue:</span>
        <span>$${totalSalonOwnerRevenue.toFixed(2)}</span>
      </div>
      <div class="report-row total">
        <span>Total Transactions:</span>
        <span>${todaySales.length}</span>
      </div>
    `;
  }

  generateMonthReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = this.sales.filter(
      (sale) => new Date(sale.date) >= startOfMonth
    );

    let totalRevenue = 0;
    let totalEmployeeCommission = 0;
    let totalSalonOwnerRevenue = 0;
    const employeeStats = {};

    monthSales.forEach((sale) => {
      totalRevenue += sale.total;

      sale.items.forEach((saleItem) => {
        const item = this.items.find((i) => i.id === saleItem.itemId);
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        // Use stored commission amounts (fallback to calculated if not stored)
        const employeeCommission =
          saleItem.commissionAmount ??
          (saleItem.total * category.commissionRate) / 100;
        const salonOwnerRevenue =
          saleItem.salonOwnerAmount ??
          (saleItem.total * category.salonOwnerRate) / 100;
        totalEmployeeCommission += employeeCommission;
        totalSalonOwnerRevenue += salonOwnerRevenue;

        // Track employee performance
        const employee = this.employees.find(
          (emp) => emp.id === sale.employeeId
        );
        if (employee) {
          if (!employeeStats[employee.id]) {
            employeeStats[employee.id] = {
              name: employee.name,
              commission: 0,
              sales: 0,
            };
          }
          employeeStats[employee.id].commission += employeeCommission;
          employeeStats[employee.id].sales += saleItem.total;
        }
      });
    });

    const reportContent = document.getElementById("monthReport");
    reportContent.innerHTML = `
      <div class="report-row">
        <span>Total Sales:</span>
        <span>$${totalRevenue.toFixed(2)}</span>
      </div>
      <div class="report-row">
        <span>Employee Commissions:</span>
        <span>$${totalEmployeeCommission.toFixed(2)}</span>
      </div>
      <div class="report-row">
        <span>Salon Owner Revenue:</span>
        <span>$${totalSalonOwnerRevenue.toFixed(2)}</span>
      </div>
      <div class="report-row total">
        <span>Total Transactions:</span>
        <span>${monthSales.length}</span>
      </div>
    `;
  }

  generateIndividualEmployeeReports() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = this.sales.filter(
      (sale) => new Date(sale.date) >= startOfMonth
    );

    const employeeStats = {};

    // Process all sales to build employee statistics
    monthSales.forEach((sale) => {
      sale.items.forEach((saleItem) => {
        const category = this.categories.find(
          (cat) => cat.id === saleItem.categoryId
        );
        // Use stored commission amounts (fallback to calculated if not stored)
        const employeeCommission =
          saleItem.commissionAmount ??
          (saleItem.total * category.commissionRate) / 100;

        const employee = this.employees.find(
          (emp) => emp.id === saleItem.employeeId
        );

        if (employee) {
          if (!employeeStats[employee.id]) {
            employeeStats[employee.id] = {
              name: employee.name,
              role: employee.role,
              totalCommission: 0,
              totalSales: 0,
              services: {},
              transactionCount: 0,
            };
          }

          employeeStats[employee.id].totalCommission += employeeCommission;
          employeeStats[employee.id].totalSales += saleItem.total;

          // Track individual services
          if (!employeeStats[employee.id].services[saleItem.name]) {
            employeeStats[employee.id].services[saleItem.name] = {
              count: 0,
              totalRevenue: 0,
              totalCommission: 0,
            };
          }

          employeeStats[employee.id].services[saleItem.name].count +=
            saleItem.quantity;
          employeeStats[employee.id].services[saleItem.name].totalRevenue +=
            saleItem.total;
          employeeStats[employee.id].services[saleItem.name].totalCommission +=
            employeeCommission;
        }
      });
    });

    // Count unique transactions per employee
    const employeeTransactions = {};
    monthSales.forEach((sale) => {
      sale.items.forEach((saleItem) => {
        if (!employeeTransactions[saleItem.employeeId]) {
          employeeTransactions[saleItem.employeeId] = new Set();
        }
        employeeTransactions[saleItem.employeeId].add(sale.id);
      });
    });

    // Update transaction counts
    Object.keys(employeeTransactions).forEach((empId) => {
      if (employeeStats[empId]) {
        employeeStats[empId].transactionCount =
          employeeTransactions[empId].size;
      }
    });

    const reportContent = document.getElementById("individualEmployeeReports");

    if (Object.keys(employeeStats).length === 0) {
      reportContent.innerHTML =
        '<div class="report-row">No sales data available for this month</div>';
      return;
    }

    const employeeCards = Object.values(employeeStats)
      .sort((a, b) => b.totalCommission - a.totalCommission) // Sort by commission earned
      .map((emp) => {
        const serviceItems = Object.entries(emp.services)
          .map(
            ([serviceName, serviceData]) => `
            <div class="service-item">
              <div>
                <div class="service-name">${serviceName}</div>
                <div class="service-count">${serviceData.count} performed</div>
              </div>
              <div>
                <div class="service-commission">$${serviceData.totalCommission.toFixed(
                  2
                )}</div>
                <div class="service-count">$${serviceData.totalRevenue.toFixed(
                  2
                )} revenue</div>
              </div>
            </div>
          `
          )
          .join("");

        return `
          <div class="employee-detail-card">
            <div class="employee-detail-header">
              <div>
                <div class="employee-name-large">${emp.name}</div>
                <div class="employee-role">${emp.role}</div>
              </div>
              <div class="employee-total-earnings">
                $${emp.totalCommission.toFixed(2)}
              </div>
            </div>
            <div class="service-breakdown">
              <div class="report-row">
                <span>Total Services Performed:</span>
                <span>${Object.values(emp.services).reduce(
                  (sum, service) => sum + service.count,
                  0
                )}</span>
              </div>
              <div class="report-row">
                <span>Total Revenue Generated:</span>
                <span>$${emp.totalSales.toFixed(2)}</span>
              </div>
              <div class="report-row">
                <span>Unique Transactions:</span>
                <span>${emp.transactionCount}</span>
              </div>
              <div class="report-row total">
                <span>Total Commission Earned:</span>
                <span>$${emp.totalCommission.toFixed(2)}</span>
              </div>
              <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e1e8ed;">
                <strong>Services Breakdown:</strong>
                ${serviceItems}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    reportContent.innerHTML = employeeCards;
  }

  generateCostAnalysisReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = this.sales.filter(
      (sale) => new Date(sale.date) >= startOfMonth
    );
    const monthExpenses = this.expenses.filter(
      (expense) => new Date(expense.date) >= startOfMonth
    );

    // Analyze costs vs selling prices
    const productAnalysis = {};
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalExpenses = 0;
    let totalProfit = 0;

    // Process all sales to analyze costs
    monthSales.forEach((sale) => {
      sale.items.forEach((saleItem) => {
        const item = this.items.find((i) => i.id === saleItem.itemId);
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );

        if (!productAnalysis[item.id]) {
          productAnalysis[item.id] = {
            name: item.name,
            category: category.name,
            isService: this.isServiceCategory(item.categoryId),
            totalQuantity: 0,
            totalRevenue: 0,
            totalCOGS: 0,
            averageSellingPrice: 0,
            averageCost: 0,
            profitMargin: 0,
            sales: [],
          };
        }

        const analysis = productAnalysis[item.id];
        analysis.totalQuantity += saleItem.quantity;
        analysis.totalRevenue += saleItem.total;
        analysis.sales.push({
          date: sale.date,
          quantity: saleItem.quantity,
          sellingPrice: saleItem.price,
          total: saleItem.total,
        });

        // For products, find the COGS from inventory records
        if (!this.isServiceCategory(item.categoryId)) {
          const inventoryRecord = this.inventory.find(
            (record) => record.saleId === sale.id && record.itemId === item.id
          );
          if (inventoryRecord && inventoryRecord.cogsTotal) {
            analysis.totalCOGS += inventoryRecord.cogsTotal;
          }
        }

        totalRevenue += saleItem.total;
      });
    });

    // Calculate averages and margins
    Object.values(productAnalysis).forEach((analysis) => {
      if (analysis.totalQuantity > 0) {
        analysis.averageSellingPrice =
          analysis.totalRevenue / analysis.totalQuantity;
        analysis.averageCost = analysis.totalCOGS / analysis.totalQuantity;
        analysis.profitMargin =
          analysis.totalRevenue > 0
            ? ((analysis.totalRevenue - analysis.totalCOGS) /
                analysis.totalRevenue) *
              100
            : 0;
      }
      totalCOGS += analysis.totalCOGS;
    });

    // Calculate total expenses
    monthExpenses.forEach((expense) => {
      totalExpenses += expense.amount;
    });

    totalProfit = totalRevenue - totalCOGS - totalExpenses;

    const reportContent = document.getElementById("costAnalysisReport");

    if (Object.keys(productAnalysis).length === 0) {
      reportContent.innerHTML =
        '<div class="report-row">No sales data available for this month</div>';
      return;
    }

    // Create summary cards
    const summaryCards = `
      <div class="cost-summary-cards">
        <div class="summary-card revenue">
          <h4>Total Revenue</h4>
          <div class="summary-value">$${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="summary-card cogs">
          <h4>Total COGS</h4>
          <div class="summary-value">$${totalCOGS.toFixed(2)}</div>
        </div>
        <div class="summary-card expenses">
          <h4>Total Expenses</h4>
          <div class="summary-value">$${totalExpenses.toFixed(2)}</div>
        </div>
        <div class="summary-card profit">
          <h4>Net Profit</h4>
          <div class="summary-value">$${totalProfit.toFixed(2)}</div>
        </div>
        <div class="summary-card margin">
          <h4>Profit Margin</h4>
          <div class="summary-value">${
            totalRevenue > 0
              ? ((totalProfit / totalRevenue) * 100).toFixed(1)
              : 0
          }%</div>
        </div>
      </div>
    `;

    // Create detailed product analysis
    const productCards = Object.values(productAnalysis)
      .sort((a, b) => b.totalRevenue - a.totalRevenue) // Sort by revenue
      .map((analysis) => {
        const costInfo = analysis.isService
          ? '<div class="cost-info">Service - No COGS</div>'
          : `<div class="cost-info">
            <div>Avg Cost: $${analysis.averageCost.toFixed(2)}</div>
            <div>Total COGS: $${analysis.totalCOGS.toFixed(2)}</div>
          </div>`;

        return `
          <div class="product-analysis-card">
            <div class="product-header">
              <div class="product-name">${analysis.name}</div>
              <div class="product-category">${analysis.category}</div>
            </div>
            <div class="product-metrics">
              <div class="metric-row">
                <span>Quantity Sold:</span>
                <span>${analysis.totalQuantity}</span>
              </div>
              <div class="metric-row">
                <span>Total Revenue:</span>
                <span>$${analysis.totalRevenue.toFixed(2)}</span>
              </div>
              <div class="metric-row">
                <span>Avg Selling Price:</span>
                <span>$${analysis.averageSellingPrice.toFixed(2)}</span>
              </div>
              ${costInfo}
              <div class="metric-row profit-margin">
                <span>Profit Margin:</span>
                <span class="${
                  analysis.profitMargin >= 0 ? "positive" : "negative"
                }">
                  ${analysis.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    reportContent.innerHTML = summaryCards + productCards;
  }

  generateBatchTrackingReport() {
    const reportContent = document.getElementById("batchTrackingReport");

    if (this.inventoryBatches.length === 0) {
      reportContent.innerHTML =
        '<div class="report-row">No inventory batches available</div>';
      return;
    }

    // Group batches by item
    const itemBatches = {};
    this.inventoryBatches.forEach((batch) => {
      if (!itemBatches[batch.itemId]) {
        itemBatches[batch.itemId] = [];
      }
      itemBatches[batch.itemId].push(batch);
    });

    const batchCards = Object.entries(itemBatches)
      .map(([itemId, batches]) => {
        const item = this.items.find((i) => i.id === itemId);
        if (!item) return "";

        // Sort batches by date
        batches.sort((a, b) => new Date(a.date) - new Date(b.date));

        const batchRows = batches
          .map((batch) => {
            const usedQuantity = batch.quantity - batch.remainingQuantity;
            const usedPercentage =
              batch.quantity > 0 ? (usedQuantity / batch.quantity) * 100 : 0;

            return `
            <div class="batch-row">
              <div class="batch-date">${new Date(
                batch.date
              ).toLocaleDateString()}</div>
              <div class="batch-type">${batch.type}</div>
              <div class="batch-cost">$${batch.unitCost.toFixed(2)}</div>
              <div class="batch-quantity">
                <div>Total: ${batch.quantity}</div>
                <div>Remaining: ${batch.remainingQuantity}</div>
                <div>Used: ${usedQuantity}</div>
              </div>
              <div class="batch-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${usedPercentage}%"></div>
                </div>
                <div class="progress-text">${usedPercentage.toFixed(
                  1
                )}% used</div>
              </div>
            </div>
          `;
          })
          .join("");

        return `
          <div class="item-batch-card">
            <div class="item-batch-header">
              <div class="item-name">${item.name}</div>
              <div class="item-category">${
                this.categories.find((cat) => cat.id === item.categoryId)
                  ?.name || "Unknown"
              }</div>
            </div>
            <div class="batch-rows">
              ${batchRows}
            </div>
          </div>
        `;
      })
      .join("");

    reportContent.innerHTML = batchCards;
  }

  generateExpensesReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = this.expenses.filter(
      (expense) => new Date(expense.date) >= startOfMonth
    );

    const reportContent = document.getElementById("expensesReport");

    if (monthExpenses.length === 0) {
      reportContent.innerHTML =
        '<div class="report-row">No expenses recorded for this month</div>';
      return;
    }

    // Group expenses by category
    const categoryExpenses = {};
    let totalExpenses = 0;

    monthExpenses.forEach((expense) => {
      const category = this.expenseCategories.find(
        (cat) => cat.id === expense.categoryId
      );
      const categoryName = category ? category.name : "Unknown";

      if (!categoryExpenses[categoryName]) {
        categoryExpenses[categoryName] = {
          name: categoryName,
          total: 0,
          count: 0,
          expenses: [],
        };
      }

      categoryExpenses[categoryName].total += expense.amount;
      categoryExpenses[categoryName].count += 1;
      categoryExpenses[categoryName].expenses.push(expense);
      totalExpenses += expense.amount;
    });

    // Create summary
    const summaryCard = `
      <div class="expense-summary-card">
        <h4>Monthly Expenses Summary</h4>
        <div class="expense-total">$${totalExpenses.toFixed(2)}</div>
        <div class="expense-count">${monthExpenses.length} expenses</div>
      </div>
    `;

    // Create category breakdown
    const categoryCards = Object.values(categoryExpenses)
      .sort((a, b) => b.total - a.total) // Sort by amount
      .map((category) => {
        const percentage =
          totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;

        const expenseList = category.expenses
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Most recent first
          .map(
            (expense) => `
            <div class="expense-item">
              <div class="expense-date">${new Date(
                expense.date
              ).toLocaleDateString()}</div>
              <div class="expense-description">${expense.description}</div>
              <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
              <div class="expense-method">${expense.paymentMethod}</div>
            </div>
          `
          )
          .join("");

        return `
          <div class="expense-category-card">
            <div class="expense-category-header">
              <div class="category-name">${category.name}</div>
              <div class="category-total">$${category.total.toFixed(2)}</div>
            </div>
            <div class="category-stats">
              <div class="stat-item">
                <span>Count:</span>
                <span>${category.count}</span>
              </div>
              <div class="stat-item">
                <span>Percentage:</span>
                <span>${percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div class="expense-list">
              ${expenseList}
            </div>
          </div>
        `;
      })
      .join("");

    reportContent.innerHTML = summaryCard + categoryCards;
  }

  // Settings Functions
  renderSettings() {
    const costingMethodSelect = document.getElementById("costingMethod");
    if (costingMethodSelect) {
      costingMethodSelect.value = this.costingMethod;
    }
  }

  saveSettings() {
    const costingMethod = document.getElementById("costingMethod").value;
    this.costingMethod = costingMethod;
    this.saveData("costingMethod", this.costingMethod);

    alert("Settings saved successfully!");
  }

  // Test Invoice Function
  createTestInvoice() {
    if (
      confirm(
        "Create a test invoice with mixed services to verify revenue calculations?"
      )
    ) {
      // Create a test sale with various services
      const testSale = {
        id: this.generateId(),
        date: new Date().toISOString(),
        employeeId: this.employees[0].id, // Gilbert Atallah
        customerId: this.customers[0].id, // First customer
        items: [
          {
            itemId: "item1", // Haircut & Styling - $45 (70% Gilbert, 30% Salon)
            name: "Haircut & Styling",
            quantity: 1,
            price: 45.0,
            total: 45.0,
          },
          {
            itemId: "item7", // Hair Extensions - $300 (80% Gilbert, 20% Salon)
            name: "Hair Extensions (Human Hair)",
            quantity: 1,
            price: 300.0,
            total: 300.0,
          },
          {
            itemId: "item9", // Premium Shampoo - $25 (95% Gilbert, 5% Salon)
            name: "Premium Shampoo",
            quantity: 2,
            price: 25.0,
            total: 50.0,
          },
          {
            itemId: "item12", // Manicure - $35 (0% Gilbert, 100% Salon)
            name: "Manicure",
            quantity: 1,
            price: 35.0,
            total: 35.0,
          },
          {
            itemId: "item16", // Nail Polish - $12 (0% Gilbert, 100% Salon)
            name: "Nail Polish",
            quantity: 3,
            price: 12.0,
            total: 36.0,
          },
          {
            itemId: "item19", // Face Mask - $40 (0% Gilbert, 100% Salon)
            name: "Hydrating Face Mask",
            quantity: 1,
            price: 40.0,
            total: 40.0,
          },
        ],
        subtotal: 506.0,
        tax: 50.6,
        total: 556.6,
      };

      // Calculate expected revenue sharing
      let expectedGilbertCommission = 0;
      let expectedSalonOwnerRevenue = 0;

      testSale.items.forEach((saleItem) => {
        const item = this.items.find((i) => i.id === saleItem.itemId);
        const category = this.categories.find(
          (cat) => cat.id === item.categoryId
        );
        // Use stored commission amounts (fallback to calculated if not stored)
        const employeeCommission =
          saleItem.commissionAmount ??
          (saleItem.total * category.commissionRate) / 100;
        const salonOwnerRevenue =
          saleItem.salonOwnerAmount ??
          (saleItem.total * category.salonOwnerRate) / 100;
        expectedGilbertCommission += employeeCommission;
        expectedSalonOwnerRevenue += salonOwnerRevenue;
      });

      // Add the test sale
      this.sales.push(testSale);
      this.saveData("sales", this.sales);

      // Show detailed breakdown
      alert(`Test Invoice Created Successfully!

Invoice Total: $${testSale.total.toFixed(2)}

Revenue Sharing Breakdown:
• Haircut & Styling ($45): Gilbert $${(45 * 0.7).toFixed(2)}, Salon $${(
        45 * 0.3
      ).toFixed(2)}
• Hair Extensions ($300): Gilbert $${(300 * 0.8).toFixed(2)}, Salon $${(
        300 * 0.2
      ).toFixed(2)}
• Premium Shampoo ($50): Gilbert $${(50 * 0.95).toFixed(2)}, Salon $${(
        50 * 0.05
      ).toFixed(2)}
• Manicure ($35): Gilbert $${(35 * 0).toFixed(2)}, Salon $${(35 * 1).toFixed(2)}
• Nail Polish ($36): Gilbert $${(36 * 0).toFixed(2)}, Salon $${(36 * 1).toFixed(
        2
      )}
• Face Mask ($40): Gilbert $${(40 * 0).toFixed(2)}, Salon $${(40 * 1).toFixed(
        2
      )}

TOTAL:
Gilbert Commission: $${expectedGilbertCommission.toFixed(2)}
Salon Owner Revenue: $${expectedSalonOwnerRevenue.toFixed(2)}

Check the Reports section to verify calculations!`);

      // Refresh displays
      this.renderAll();
    }
  }
}

// Initialize the POS system when the page loads
let pos;
document.addEventListener("DOMContentLoaded", () => {
  pos = new POSSystem();
});
