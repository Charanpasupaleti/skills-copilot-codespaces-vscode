const logger = require('../utils/logger');

class DataProcessor {
  constructor() {
    this.processors = new Map();
  }

  registerProcessor(type, processorFn) {
    logger.info(`Registering data processor: ${type}`);
    this.processors.set(type, processorFn);
  }

  async process(type, data) {
    logger.info(`Processing data of type: ${type}`);
    const processor = this.processors.get(type);
    
    if (!processor) {
      throw new Error(`No processor registered for type: ${type}`);
    }

    try {
      const result = await processor(data);
      logger.info(`Data processing completed for type: ${type}`);
      return result;
    } catch (error) {
      logger.error(`Error processing data of type ${type}:`, error);
      throw error;
    }
  }

  async batchProcess(type, dataArray) {
    logger.info(`Batch processing ${dataArray.length} items of type: ${type}`);
    const results = [];
    
    for (const data of dataArray) {
      try {
        const result = await this.process(type, data);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Batch processing completed: ${successCount}/${dataArray.length} successful`);
    
    return results;
  }

  async transform(data, transformations) {
    logger.info('Applying data transformations...');
    let result = data;
    
    for (const transform of transformations) {
      result = await transform(result);
    }
    
    return result;
  }

  validate(data, schema) {
    logger.info('Validating data against schema...');
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !data[field]) {
        errors.push(`Field ${field} is required`);
      }
      
      if (rules.type && typeof data[field] !== rules.type) {
        errors.push(`Field ${field} must be of type ${rules.type}`);
      }
      
      if (rules.min && data[field] < rules.min) {
        errors.push(`Field ${field} must be at least ${rules.min}`);
      }
      
      if (rules.max && data[field] > rules.max) {
        errors.push(`Field ${field} must be at most ${rules.max}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = DataProcessor;
