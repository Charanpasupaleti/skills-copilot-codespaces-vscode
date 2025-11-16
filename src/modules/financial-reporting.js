const logger = require('../utils/logger');

class FinancialReporting {
  constructor(aiEngine, dataProcessor) {
    this.aiEngine = aiEngine;
    this.dataProcessor = dataProcessor;
    this.transactions = [];
  }

  recordTransaction(transaction) {
    logger.info(`Recording transaction: ${transaction.type}`);
    
    const validation = this.dataProcessor.validate(transaction, {
      amount: { required: true, type: 'number' },
      type: { required: true, type: 'string' },
      date: { required: true, type: 'string' }
    });
    
    if (!validation.valid) {
      throw new Error(`Invalid transaction: ${validation.errors.join(', ')}`);
    }
    
    this.transactions.push({
      ...transaction,
      recordedAt: new Date().toISOString()
    });
    
    return transaction;
  }

  async generateFinancialReport(period) {
    logger.info(`Generating financial report for ${period}`);
    
    const relevantTransactions = this.filterTransactionsByPeriod(period);
    const summary = this.calculateSummary(relevantTransactions);
    
    const specifications = `Generate a comprehensive financial report for ${period}:
      
      Total Revenue: $${summary.revenue.toFixed(2)}
      Total Expenses: $${summary.expenses.toFixed(2)}
      Net Income: $${summary.netIncome.toFixed(2)}
      Transaction Count: ${relevantTransactions.length}
      
      Include: Executive Summary, Key Metrics, Trends Analysis, and Recommendations`;
    
    const report = await this.aiEngine.generateContent('report', specifications);
    
    return {
      period,
      summary,
      report,
      generatedAt: new Date().toISOString()
    };
  }

  filterTransactionsByPeriod(period) {
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarterly':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }
    
    return this.transactions.filter(t => 
      new Date(t.date) >= startDate
    );
  }

  calculateSummary(transactions) {
    let revenue = 0;
    let expenses = 0;
    
    for (const transaction of transactions) {
      if (transaction.type === 'income' || transaction.type === 'revenue') {
        revenue += transaction.amount;
      } else if (transaction.type === 'expense' || transaction.type === 'cost') {
        expenses += transaction.amount;
      }
    }
    
    return {
      revenue,
      expenses,
      netIncome: revenue - expenses,
      transactionCount: transactions.length
    };
  }

  async analyzeCashFlow(months = 3) {
    logger.info(`Analyzing cash flow for ${months} months`);
    
    const monthlyData = this.getMonthlyBreakdown(months);
    
    const context = `Analyze this cash flow data and provide insights:
      ${JSON.stringify(monthlyData, null, 2)}
      
      Identify trends, risks, and opportunities for improvement.`;
    
    const analysis = await this.aiEngine.analyzeBusinessProcess(context);
    
    return {
      monthlyData,
      analysis
    };
  }

  getMonthlyBreakdown(months) {
    const breakdown = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = this.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const summary = this.calculateSummary(monthTransactions);
      
      breakdown.unshift({
        month: monthStart.toISOString().substring(0, 7),
        ...summary
      });
    }
    
    return breakdown;
  }

  async generateBudgetForecast(targetPeriod) {
    logger.info(`Generating budget forecast for ${targetPeriod}`);
    
    const historicalData = this.getMonthlyBreakdown(6);
    
    const specifications = `Based on this historical financial data, create a budget forecast for ${targetPeriod}:
      ${JSON.stringify(historicalData, null, 2)}
      
      Include revenue projections, expense estimates, and key assumptions.`;
    
    const forecast = await this.aiEngine.generateContent('report', specifications);
    
    return forecast;
  }

  async detectAnomalies() {
    logger.info('Detecting financial anomalies...');
    
    const recentTransactions = this.transactions.slice(-100);
    
    const context = `Analyze these recent transactions for anomalies, unusual patterns, or potential fraud:
      ${JSON.stringify(recentTransactions, null, 2)}`;
    
    const analysis = await this.aiEngine.analyzeBusinessProcess(context);
    
    return analysis;
  }
}

module.exports = FinancialReporting;
