require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const config = require('./config/settings');

// Core modules
const AIEngine = require('./core/ai-engine');
const WorkflowAutomation = require('./core/workflow-automation');
const DataProcessor = require('./core/data-processor');

// Business modules
const CustomerServiceBot = require('./modules/customer-service');
const DocumentProcessor = require('./modules/document-processor');
const SalesAutomation = require('./modules/sales-automation');
const InventoryManagement = require('./modules/inventory-management');
const FinancialReporting = require('./modules/financial-reporting');

class BusinessAutomationSystem {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize core components
    this.aiEngine = new AIEngine();
    this.workflowAutomation = new WorkflowAutomation();
    this.dataProcessor = new DataProcessor();
    
    // Initialize business modules
    this.customerService = new CustomerServiceBot(this.aiEngine);
    this.documentProcessor = new DocumentProcessor(this.aiEngine, this.dataProcessor);
    this.salesAutomation = new SalesAutomation(this.aiEngine);
    this.inventoryManagement = new InventoryManagement(this.aiEngine, this.dataProcessor);
    this.financialReporting = new FinancialReporting(this.aiEngine, this.dataProcessor);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWorkflows();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Customer Service endpoints
    this.app.post('/api/customer-service/query', async (req, res) => {
      try {
        const { customerId, query } = req.body;
        const response = await this.customerService.handleCustomerQuery(customerId, query);
        res.json({ success: true, response });
      } catch (error) {
        logger.error('Customer service error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Document Processing endpoints
    this.app.post('/api/documents/process', async (req, res) => {
      try {
        const { type, content } = req.body;
        let result;
        
        if (type === 'invoice') {
          result = await this.documentProcessor.processInvoice(content);
        } else if (type === 'contract') {
          result = await this.documentProcessor.processContract(content);
        } else {
          result = await this.documentProcessor.summarizeDocument(content);
        }
        
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Document processing error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Sales Automation endpoints
    this.app.post('/api/sales/score-lead', async (req, res) => {
      try {
        const leadData = req.body;
        const result = await this.salesAutomation.scoreLead(leadData);
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Lead scoring error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/sales/generate-proposal', async (req, res) => {
      try {
        const { clientData, requirements } = req.body;
        const proposal = await this.salesAutomation.generateProposal(clientData, requirements);
        res.json({ success: true, proposal });
      } catch (error) {
        logger.error('Proposal generation error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/sales/high-priority-leads', (req, res) => {
      try {
        const minScore = parseInt(req.query.minScore) || 70;
        const leads = this.salesAutomation.getHighPriorityLeads(minScore);
        res.json({ success: true, leads });
      } catch (error) {
        logger.error('Error fetching leads:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Inventory Management endpoints
    this.app.post('/api/inventory/add', (req, res) => {
      try {
        const item = this.inventoryManagement.addItem(req.body);
        res.json({ success: true, item });
      } catch (error) {
        logger.error('Inventory add error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.put('/api/inventory/:sku/quantity', (req, res) => {
      try {
        const { sku } = req.params;
        const { quantity } = req.body;
        const item = this.inventoryManagement.updateQuantity(sku, quantity);
        res.json({ success: true, item });
      } catch (error) {
        logger.error('Inventory update error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/inventory/low-stock', (req, res) => {
      try {
        const items = this.inventoryManagement.getLowStockItems();
        res.json({ success: true, items });
      } catch (error) {
        logger.error('Low stock check error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Financial Reporting endpoints
    this.app.post('/api/finance/transaction', (req, res) => {
      try {
        const transaction = this.financialReporting.recordTransaction(req.body);
        res.json({ success: true, transaction });
      } catch (error) {
        logger.error('Transaction recording error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/finance/report/:period', async (req, res) => {
      try {
        const { period } = req.params;
        const report = await this.financialReporting.generateFinancialReport(period);
        res.json({ success: true, report });
      } catch (error) {
        logger.error('Report generation error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/finance/cashflow', async (req, res) => {
      try {
        const months = parseInt(req.query.months) || 3;
        const analysis = await this.financialReporting.analyzeCashFlow(months);
        res.json({ success: true, analysis });
      } catch (error) {
        logger.error('Cash flow analysis error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Workflow endpoints
    this.app.get('/api/workflows', (req, res) => {
      try {
        const workflows = this.workflowAutomation.listWorkflows();
        res.json({ success: true, workflows });
      } catch (error) {
        logger.error('Workflow list error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/workflows/:name/execute', async (req, res) => {
      try {
        const { name } = req.params;
        const result = await this.workflowAutomation.executeWorkflow(name, req.body);
        res.json({ success: true, result });
      } catch (error) {
        logger.error('Workflow execution error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWorkflows() {
    logger.info('Setting up automated workflows...');
    
    // Daily customer service summary workflow
    this.workflowAutomation.registerWorkflow('daily-customer-summary', [
      {
        name: 'Generate Summary',
        execute: async () => {
          logger.info('Generating daily customer service summary');
          return { message: 'Daily summary generated' };
        }
      }
    ]);

    // Weekly sales analysis workflow
    this.workflowAutomation.registerWorkflow('weekly-sales-analysis', [
      {
        name: 'Analyze Sales Data',
        execute: async (data) => {
          logger.info('Analyzing weekly sales data');
          const leads = this.salesAutomation.getHighPriorityLeads();
          return { leadCount: leads.length, leads };
        }
      }
    ]);

    // Monthly financial reporting workflow
    this.workflowAutomation.registerWorkflow('monthly-financial-report', [
      {
        name: 'Generate Monthly Report',
        execute: async () => {
          logger.info('Generating monthly financial report');
          const report = await this.financialReporting.generateFinancialReport('monthly');
          return report;
        }
      }
    ]);

    // Inventory check workflow
    this.workflowAutomation.registerWorkflow('inventory-check', [
      {
        name: 'Check Low Stock',
        execute: async () => {
          logger.info('Checking inventory levels');
          const lowStock = this.inventoryManagement.getLowStockItems();
          return { lowStockCount: lowStock.length, items: lowStock };
        }
      }
    ]);

    logger.info('Automated workflows configured successfully');
  }

  start() {
    this.app.listen(this.port, () => {
      logger.info(`Business Automation System started on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Business: ${config.business.name}`);
      logger.info('System ready for automation!');
    });
  }
}

// Start the system
if (require.main === module) {
  const system = new BusinessAutomationSystem();
  system.start();
}

module.exports = BusinessAutomationSystem;
