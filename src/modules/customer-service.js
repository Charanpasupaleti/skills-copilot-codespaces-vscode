const logger = require('../utils/logger');

class CustomerServiceBot {
  constructor(aiEngine) {
    this.aiEngine = aiEngine;
    this.conversationHistory = new Map();
  }

  async handleCustomerQuery(customerId, query) {
    logger.info(`Handling customer query from ${customerId}`);
    
    if (!this.conversationHistory.has(customerId)) {
      this.conversationHistory.set(customerId, []);
    }
    
    const history = this.conversationHistory.get(customerId);
    history.push({ role: 'user', content: query });
    
    const context = this.buildContext(history);
    const response = await this.aiEngine.generateContent('email', 
      `You are a helpful customer service representative. Respond to this customer query professionally: ${query}\n\nContext: ${context}`
    );
    
    history.push({ role: 'assistant', content: response });
    
    if (history.length > 20) {
      history.shift();
      history.shift();
    }
    
    logger.info('Customer query handled successfully');
    return response;
  }

  buildContext(history) {
    return history.slice(-10).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
  }

  async categorizeQuery(query) {
    logger.info('Categorizing customer query...');
    const categories = ['billing', 'technical', 'general', 'complaint', 'feedback'];
    
    const decision = await this.aiEngine.makeDecision(
      `Categorize this customer query: "${query}"`,
      categories
    );
    
    return decision;
  }

  async generateAutoResponse(queryType, customerName) {
    logger.info(`Generating auto-response for ${queryType}`);
    
    const templates = {
      billing: `Dear ${customerName}, thank you for your billing inquiry. Our team is reviewing your account and will respond within 24 hours.`,
      technical: `Dear ${customerName}, we've received your technical support request. Our engineers are investigating and will contact you shortly.`,
      general: `Dear ${customerName}, thank you for contacting us. We will respond to your inquiry as soon as possible.`
    };
    
    return templates[queryType] || templates.general;
  }

  clearHistory(customerId) {
    this.conversationHistory.delete(customerId);
    logger.info(`Cleared conversation history for ${customerId}`);
  }
}

module.exports = CustomerServiceBot;
