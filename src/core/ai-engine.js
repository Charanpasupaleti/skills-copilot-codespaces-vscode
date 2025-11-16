const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIEngine {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async analyzeBusinessProcess(processDescription) {
    try {
      logger.info('Analyzing business process...');
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business process analyst AI. Analyze the given business process and provide optimization recommendations.'
          },
          {
            role: 'user',
            content: processDescription
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error analyzing business process:', error);
      throw error;
    }
  }

  async makeDecision(context, options) {
    try {
      logger.info('Making AI-powered decision...');
      const prompt = `Given the following context: ${context}\n\nOptions: ${options.join(', ')}\n\nProvide the best decision and explain why.`;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business decision-making AI. Analyze options and provide the optimal choice with reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error making decision:', error);
      throw error;
    }
  }

  async generateContent(type, specifications) {
    try {
      logger.info(`Generating ${type} content...`);
      const prompts = {
        email: 'Generate a professional business email based on these specifications:',
        report: 'Generate a detailed business report based on these specifications:',
        proposal: 'Generate a business proposal based on these specifications:',
        marketing: 'Generate marketing content based on these specifications:'
      };

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional business content generator. ${prompts[type] || 'Generate content based on:'}`
          },
          {
            role: 'user',
            content: specifications
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating content:', error);
      throw error;
    }
  }

  async extractInformation(document, fields) {
    try {
      logger.info('Extracting information from document...');
      const prompt = `Extract the following fields from this document: ${fields.join(', ')}\n\nDocument: ${document}`;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a document processing AI. Extract structured information from documents and return as JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error extracting information:', error);
      throw error;
    }
  }
}

module.exports = AIEngine;
