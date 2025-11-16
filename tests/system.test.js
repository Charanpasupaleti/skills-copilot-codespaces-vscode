const AIEngine = require('../src/core/ai-engine');
const WorkflowAutomation = require('../src/core/workflow-automation');
const DataProcessor = require('../src/core/data-processor');

describe('AI Business Automation System', () => {
  describe('DataProcessor', () => {
    let processor;

    beforeEach(() => {
      processor = new DataProcessor();
    });

    test('should validate data correctly', () => {
      const data = {
        name: 'Test',
        amount: 100,
        email: 'test@example.com'
      };

      const schema = {
        name: { required: true, type: 'string' },
        amount: { required: true, type: 'number', min: 0 }
      };

      const result = processor.validate(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const data = {
        amount: 100
      };

      const schema = {
        name: { required: true, type: 'string' },
        amount: { required: true, type: 'number' }
      };

      const result = processor.validate(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field name is required');
    });

    test('should detect type mismatches', () => {
      const data = {
        name: 'Test',
        amount: 'not a number'
      };

      const schema = {
        name: { required: true, type: 'string' },
        amount: { required: true, type: 'number' }
      };

      const result = processor.validate(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate min/max constraints', () => {
      const data = {
        amount: -10
      };

      const schema = {
        amount: { required: true, type: 'number', min: 0 }
      };

      const result = processor.validate(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field amount must be at least 0');
    });
  });

  describe('WorkflowAutomation', () => {
    let workflow;

    beforeEach(() => {
      workflow = new WorkflowAutomation();
    });

    test('should register workflows', () => {
      workflow.registerWorkflow('test-workflow', [
        {
          name: 'Step 1',
          execute: async (input) => input
        }
      ]);

      const workflows = workflow.listWorkflows();
      expect(workflows).toContain('test-workflow');
    });

    test('should execute simple workflow', async () => {
      workflow.registerWorkflow('simple-workflow', [
        {
          name: 'Double',
          execute: async (input) => input * 2
        },
        {
          name: 'Add 10',
          execute: async (input) => input + 10
        }
      ]);

      const result = await workflow.executeWorkflow('simple-workflow', 5);
      expect(result).toBe(20); // (5 * 2) + 10 = 20
    });

    test('should handle workflow errors', async () => {
      workflow.registerWorkflow('error-workflow', [
        {
          name: 'Throw Error',
          execute: async () => {
            throw new Error('Test error');
          }
        }
      ]);

      await expect(
        workflow.executeWorkflow('error-workflow', {})
      ).rejects.toThrow('Test error');
    });

    test('should throw error for non-existent workflow', async () => {
      await expect(
        workflow.executeWorkflow('non-existent', {})
      ).rejects.toThrow('Workflow non-existent not found');
    });
  });

  describe('Integration Tests', () => {
    test('data processor should work with workflows', async () => {
      const processor = new DataProcessor();
      const workflow = new WorkflowAutomation();

      workflow.registerWorkflow('data-validation-workflow', [
        {
          name: 'Validate',
          execute: async (data) => {
            const schema = {
              amount: { required: true, type: 'number', min: 0 }
            };
            const validation = processor.validate(data, schema);
            if (!validation.valid) {
              throw new Error(validation.errors.join(', '));
            }
            return data;
          }
        },
        {
          name: 'Process',
          execute: async (data) => {
            return { ...data, processed: true };
          }
        }
      ]);

      const result = await workflow.executeWorkflow('data-validation-workflow', {
        amount: 100
      });

      expect(result.processed).toBe(true);
      expect(result.amount).toBe(100);
    });
  });
});
