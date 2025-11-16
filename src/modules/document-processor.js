const logger = require('../utils/logger');

class DocumentProcessor {
  constructor(aiEngine, dataProcessor) {
    this.aiEngine = aiEngine;
    this.dataProcessor = dataProcessor;
  }

  async processInvoice(invoiceText) {
    logger.info('Processing invoice document...');
    
    const fields = [
      'invoice_number',
      'date',
      'vendor_name',
      'total_amount',
      'line_items',
      'payment_terms'
    ];
    
    try {
      const extractedData = await this.aiEngine.extractInformation(invoiceText, fields);
      
      const validation = this.dataProcessor.validate(extractedData, {
        invoice_number: { required: true, type: 'string' },
        total_amount: { required: true, type: 'number', min: 0 }
      });
      
      if (!validation.valid) {
        logger.warn('Invoice validation failed:', validation.errors);
      }
      
      logger.info('Invoice processed successfully');
      return {
        ...extractedData,
        validation,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error processing invoice:', error);
      throw error;
    }
  }

  async processContract(contractText) {
    logger.info('Processing contract document...');
    
    const fields = [
      'parties',
      'effective_date',
      'expiration_date',
      'key_terms',
      'payment_schedule',
      'termination_clauses'
    ];
    
    const extractedData = await this.aiEngine.extractInformation(contractText, fields);
    
    logger.info('Contract processed successfully');
    return {
      ...extractedData,
      processedAt: new Date().toISOString()
    };
  }

  async summarizeDocument(documentText) {
    logger.info('Summarizing document...');
    
    const summary = await this.aiEngine.generateContent('report',
      `Provide a concise executive summary of this document:\n\n${documentText}`
    );
    
    return summary;
  }

  async classifyDocument(documentText) {
    logger.info('Classifying document...');
    
    const types = ['invoice', 'contract', 'proposal', 'report', 'email', 'other'];
    const classification = await this.aiEngine.makeDecision(
      `Classify this document type: ${documentText.substring(0, 500)}`,
      types
    );
    
    return classification;
  }

  async batchProcessDocuments(documents) {
    logger.info(`Batch processing ${documents.length} documents...`);
    
    const results = [];
    for (const doc of documents) {
      try {
        const type = await this.classifyDocument(doc.content);
        let processed;
        
        if (type.includes('invoice')) {
          processed = await this.processInvoice(doc.content);
        } else if (type.includes('contract')) {
          processed = await this.processContract(doc.content);
        } else {
          processed = await this.summarizeDocument(doc.content);
        }
        
        results.push({
          success: true,
          documentId: doc.id,
          type,
          data: processed
        });
      } catch (error) {
        results.push({
          success: false,
          documentId: doc.id,
          error: error.message
        });
      }
    }
    
    logger.info('Batch document processing completed');
    return results;
  }
}

module.exports = DocumentProcessor;
