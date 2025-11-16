const logger = require('../utils/logger');

class InventoryManagement {
  constructor(aiEngine, dataProcessor) {
    this.aiEngine = aiEngine;
    this.dataProcessor = dataProcessor;
    this.inventory = new Map();
  }

  addItem(itemData) {
    logger.info(`Adding item to inventory: ${itemData.sku}`);
    
    const validation = this.dataProcessor.validate(itemData, {
      sku: { required: true, type: 'string' },
      quantity: { required: true, type: 'number', min: 0 },
      reorderPoint: { required: true, type: 'number', min: 0 }
    });
    
    if (!validation.valid) {
      throw new Error(`Invalid item data: ${validation.errors.join(', ')}`);
    }
    
    this.inventory.set(itemData.sku, {
      ...itemData,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    return this.inventory.get(itemData.sku);
  }

  updateQuantity(sku, quantity) {
    logger.info(`Updating quantity for ${sku}: ${quantity}`);
    
    const item = this.inventory.get(sku);
    if (!item) {
      throw new Error(`Item ${sku} not found in inventory`);
    }
    
    item.quantity = quantity;
    item.lastUpdated = new Date().toISOString();
    
    this.checkReorderPoint(sku);
    
    return item;
  }

  checkReorderPoint(sku) {
    const item = this.inventory.get(sku);
    
    if (item.quantity <= item.reorderPoint) {
      logger.warn(`ALERT: Item ${sku} is at or below reorder point`);
      return {
        alert: true,
        message: `Reorder needed for ${item.name} (SKU: ${sku})`,
        currentQuantity: item.quantity,
        reorderPoint: item.reorderPoint
      };
    }
    
    return { alert: false };
  }

  async predictDemand(sku, historicalData) {
    logger.info(`Predicting demand for ${sku}`);
    
    const context = `Analyze this historical sales data and predict future demand:
      SKU: ${sku}
      Historical Data: ${JSON.stringify(historicalData)}
      
      Provide demand forecast for the next 30, 60, and 90 days.`;
    
    const forecast = await this.aiEngine.analyzeBusinessProcess(context);
    
    return forecast;
  }

  async optimizeInventory() {
    logger.info('Optimizing inventory levels...');
    
    const inventoryData = Array.from(this.inventory.values());
    
    const context = `Analyze this inventory and provide optimization recommendations:
      ${JSON.stringify(inventoryData, null, 2)}
      
      Consider: turnover rates, holding costs, reorder points, and seasonal trends.`;
    
    const recommendations = await this.aiEngine.analyzeBusinessProcess(context);
    
    return recommendations;
  }

  getLowStockItems() {
    const lowStock = [];
    
    for (const item of this.inventory.values()) {
      if (item.quantity <= item.reorderPoint) {
        lowStock.push(item);
      }
    }
    
    return lowStock.sort((a, b) => 
      (a.quantity / a.reorderPoint) - (b.quantity / b.reorderPoint)
    );
  }

  async generatePurchaseOrder(sku, quantity) {
    logger.info(`Generating purchase order for ${sku}`);
    
    const item = this.inventory.get(sku);
    if (!item) {
      throw new Error(`Item ${sku} not found`);
    }
    
    const specifications = `Generate a purchase order for:
      Item: ${item.name}
      SKU: ${sku}
      Quantity: ${quantity}
      Supplier: ${item.supplier}
      Unit Cost: ${item.unitCost}
      Total: ${quantity * item.unitCost}`;
    
    const purchaseOrder = await this.aiEngine.generateContent('report', specifications);
    
    return {
      sku,
      quantity,
      totalCost: quantity * item.unitCost,
      purchaseOrder,
      createdAt: new Date().toISOString()
    };
  }

  getInventoryValue() {
    let totalValue = 0;
    
    for (const item of this.inventory.values()) {
      totalValue += item.quantity * (item.unitCost || 0);
    }
    
    return totalValue;
  }
}

module.exports = InventoryManagement;
