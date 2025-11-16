const logger = require('../utils/logger');

class WorkflowAutomation {
  constructor() {
    this.workflows = new Map();
    this.activeWorkflows = new Map();
  }

  registerWorkflow(name, steps) {
    logger.info(`Registering workflow: ${name}`);
    this.workflows.set(name, {
      name,
      steps,
      status: 'registered'
    });
  }

  async executeWorkflow(name, input) {
    logger.info(`Executing workflow: ${name}`);
    const workflow = this.workflows.get(name);
    
    if (!workflow) {
      throw new Error(`Workflow ${name} not found`);
    }

    const executionId = `${name}-${Date.now()}`;
    this.activeWorkflows.set(executionId, {
      name,
      status: 'running',
      startTime: new Date(),
      currentStep: 0
    });

    try {
      let result = input;
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        logger.info(`Executing step ${i + 1}/${workflow.steps.length}: ${step.name}`);
        
        this.activeWorkflows.get(executionId).currentStep = i;
        result = await step.execute(result);
      }

      this.activeWorkflows.get(executionId).status = 'completed';
      this.activeWorkflows.get(executionId).endTime = new Date();
      
      logger.info(`Workflow ${name} completed successfully`);
      return result;
    } catch (error) {
      this.activeWorkflows.get(executionId).status = 'failed';
      this.activeWorkflows.get(executionId).error = error.message;
      logger.error(`Workflow ${name} failed:`, error);
      throw error;
    }
  }

  getWorkflowStatus(executionId) {
    return this.activeWorkflows.get(executionId);
  }

  listWorkflows() {
    return Array.from(this.workflows.keys());
  }

  async scheduleWorkflow(name, cronExpression, input) {
    logger.info(`Scheduling workflow ${name} with cron: ${cronExpression}`);
    const cron = require('node-cron');
    
    return cron.schedule(cronExpression, async () => {
      logger.info(`Scheduled execution of workflow: ${name}`);
      await this.executeWorkflow(name, input);
    });
  }
}

module.exports = WorkflowAutomation;
