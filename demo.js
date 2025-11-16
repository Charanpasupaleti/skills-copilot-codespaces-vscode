#!/usr/bin/env node

/**
 * Quick Demo Script for AI Business Automation System
 * This demonstrates the system's capabilities without requiring an OpenAI API key
 */

const DataProcessor = require('./src/core/data-processor');
const WorkflowAutomation = require('./src/core/workflow-automation');
const InventoryManagement = require('./src/modules/inventory-management');
const FinancialReporting = require('./src/modules/financial-reporting');

console.log('='.repeat(80));
console.log('AI BUSINESS AUTOMATION SYSTEM - DEMO');
console.log('='.repeat(80));
console.log();

// Demo 1: Data Validation
console.log('📊 DEMO 1: Data Validation');
console.log('-'.repeat(80));
const processor = new DataProcessor();

const customerData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 35,
  creditLimit: 10000
};

const schema = {
  name: { required: true, type: 'string' },
  email: { required: true, type: 'string' },
  age: { required: true, type: 'number', min: 18 },
  creditLimit: { required: true, type: 'number', min: 0, max: 100000 }
};

const validation = processor.validate(customerData, schema);
console.log('Customer Data:', JSON.stringify(customerData, null, 2));
console.log('Validation Result:', validation.valid ? '✅ Valid' : '❌ Invalid');
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
console.log();

// Demo 2: Workflow Automation
console.log('⚙️  DEMO 2: Workflow Automation');
console.log('-'.repeat(80));
const workflow = new WorkflowAutomation();

workflow.registerWorkflow('order-processing', [
  {
    name: 'Validate Order',
    execute: async (order) => {
      console.log(`  ✓ Validating order #${order.id}...`);
      return { ...order, validated: true };
    }
  },
  {
    name: 'Calculate Total',
    execute: async (order) => {
      const total = order.items.reduce((sum, item) => sum + item.price, 0);
      console.log(`  ✓ Order total calculated: $${total}`);
      return { ...order, total };
    }
  },
  {
    name: 'Process Payment',
    execute: async (order) => {
      console.log(`  ✓ Payment processed: $${order.total}`);
      return { ...order, paid: true };
    }
  }
]);

const sampleOrder = {
  id: '12345',
  customer: 'Jane Smith',
  items: [
    { name: 'Product A', price: 50 },
    { name: 'Product B', price: 75 }
  ]
};

workflow.executeWorkflow('order-processing', sampleOrder).then(result => {
  console.log('Final Order:', JSON.stringify(result, null, 2));
  console.log();

  // Demo 3: Inventory Management
  console.log('📦 DEMO 3: Inventory Management');
  console.log('-'.repeat(80));
  const inventory = new InventoryManagement(null, processor);

  inventory.addItem({
    sku: 'LAPTOP-001',
    name: 'Business Laptop Pro',
    quantity: 50,
    reorderPoint: 15,
    unitCost: 1200,
    supplier: 'Tech Distributors'
  });

  inventory.addItem({
    sku: 'MOUSE-001',
    name: 'Wireless Mouse',
    quantity: 10, // Below reorder point!
    reorderPoint: 20,
    unitCost: 25,
    supplier: 'Office Supplies Co'
  });

  inventory.addItem({
    sku: 'KEYBOARD-001',
    name: 'Mechanical Keyboard',
    quantity: 30,
    reorderPoint: 10,
    unitCost: 150,
    supplier: 'Tech Distributors'
  });

  console.log('Inventory Items Added: 3');
  console.log('Total Inventory Value: $', inventory.getInventoryValue().toFixed(2));
  console.log();

  const lowStock = inventory.getLowStockItems();
  console.log('⚠️  Low Stock Alerts:');
  lowStock.forEach(item => {
    console.log(`  - ${item.name} (SKU: ${item.sku}): ${item.quantity} units (reorder at ${item.reorderPoint})`);
  });
  console.log();

  // Demo 4: Financial Reporting
  console.log('💰 DEMO 4: Financial Reporting');
  console.log('-'.repeat(80));
  const finance = new FinancialReporting(null, processor);

  // Record some transactions
  finance.recordTransaction({
    amount: 5000,
    type: 'revenue',
    date: '2024-01-15',
    description: 'Product sales'
  });

  finance.recordTransaction({
    amount: 1500,
    type: 'expense',
    date: '2024-01-15',
    description: 'Office supplies'
  });

  finance.recordTransaction({
    amount: 3500,
    type: 'revenue',
    date: '2024-01-16',
    description: 'Consulting services'
  });

  finance.recordTransaction({
    amount: 800,
    type: 'expense',
    date: '2024-01-16',
    description: 'Marketing'
  });

  const dailyTransactions = finance.filterTransactionsByPeriod('daily');
  const summary = finance.calculateSummary(dailyTransactions);

  console.log('Transactions Recorded: 4');
  console.log('Financial Summary:');
  console.log(`  Revenue:   $${summary.revenue.toFixed(2)}`);
  console.log(`  Expenses:  $${summary.expenses.toFixed(2)}`);
  console.log(`  Net Income: $${summary.netIncome.toFixed(2)}`);
  console.log(`  Transactions: ${summary.transactionCount}`);
  console.log();

  console.log('='.repeat(80));
  console.log('✅ DEMO COMPLETED SUCCESSFULLY');
  console.log('='.repeat(80));
  console.log();
  console.log('To use the full system with AI features:');
  console.log('1. Set your OPENAI_API_KEY in .env file');
  console.log('2. Run: npm start');
  console.log('3. Access the API at http://localhost:3000');
  console.log();
  console.log('For more information, see README.md');
  console.log();
});
