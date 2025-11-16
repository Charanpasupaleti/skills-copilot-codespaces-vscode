const logger = require('../utils/logger');

class SalesAutomation {
  constructor(aiEngine) {
    this.aiEngine = aiEngine;
    this.leads = new Map();
    this.campaigns = new Map();
  }

  async scoreLead(leadData) {
    logger.info(`Scoring lead: ${leadData.email}`);
    
    const context = `Analyze this lead and provide a score from 0-100 based on conversion potential:
      Company: ${leadData.company}
      Industry: ${leadData.industry}
      Budget: ${leadData.budget}
      Timeline: ${leadData.timeline}
      Engagement: ${leadData.engagement}`;
    
    const analysis = await this.aiEngine.analyzeBusinessProcess(context);
    
    const score = this.extractScore(analysis);
    
    this.leads.set(leadData.email, {
      ...leadData,
      score,
      analysis,
      scoredAt: new Date().toISOString()
    });
    
    logger.info(`Lead scored: ${score}/100`);
    return { score, analysis };
  }

  extractScore(analysis) {
    const match = analysis.match(/\b(\d{1,3})\b/);
    return match ? parseInt(match[1]) : 50;
  }

  async generateProposal(clientData, requirements) {
    logger.info(`Generating proposal for ${clientData.name}`);
    
    const specifications = `Create a professional business proposal for:
      Client: ${clientData.name}
      Industry: ${clientData.industry}
      Requirements: ${requirements}
      Budget Range: ${clientData.budgetRange}
      Timeline: ${clientData.timeline}
      
      Include: Executive Summary, Proposed Solution, Timeline, Pricing, and Next Steps`;
    
    const proposal = await this.aiEngine.generateContent('proposal', specifications);
    
    logger.info('Proposal generated successfully');
    return proposal;
  }

  async createMarketingCampaign(campaignData) {
    logger.info(`Creating marketing campaign: ${campaignData.name}`);
    
    const specifications = `Create a marketing campaign with:
      Campaign Name: ${campaignData.name}
      Target Audience: ${campaignData.targetAudience}
      Goals: ${campaignData.goals}
      Budget: ${campaignData.budget}
      Duration: ${campaignData.duration}
      
      Generate: Campaign strategy, key messages, channel recommendations, and success metrics`;
    
    const campaign = await this.aiEngine.generateContent('marketing', specifications);
    
    this.campaigns.set(campaignData.name, {
      ...campaignData,
      strategy: campaign,
      status: 'draft',
      createdAt: new Date().toISOString()
    });
    
    logger.info('Marketing campaign created successfully');
    return campaign;
  }

  async generateEmailSequence(leadData, sequenceType) {
    logger.info(`Generating email sequence for ${leadData.email}`);
    
    const sequences = {
      welcome: 3,
      nurture: 5,
      conversion: 4,
      retention: 6
    };
    
    const emailCount = sequences[sequenceType] || 3;
    const emails = [];
    
    for (let i = 1; i <= emailCount; i++) {
      const specifications = `Generate email ${i} of ${emailCount} for a ${sequenceType} sequence:
        Lead: ${leadData.name}
        Company: ${leadData.company}
        Interest: ${leadData.interest}
        
        This email should be professional, engaging, and aligned with the sequence goals.`;
      
      const email = await this.aiEngine.generateContent('email', specifications);
      emails.push({
        number: i,
        subject: this.extractSubject(email),
        content: email,
        sendDelay: i * 2
      });
    }
    
    logger.info(`Generated ${emailCount} emails for ${sequenceType} sequence`);
    return emails;
  }

  extractSubject(email) {
    const match = email.match(/Subject:\s*(.+)/i);
    return match ? match[1].trim() : 'Your Personalized Message';
  }

  getHighPriorityLeads(minScore = 70) {
    const highPriority = [];
    
    for (const [email, lead] of this.leads.entries()) {
      if (lead.score >= minScore) {
        highPriority.push(lead);
      }
    }
    
    return highPriority.sort((a, b) => b.score - a.score);
  }

  async analyzeSalesPerformance(salesData) {
    logger.info('Analyzing sales performance...');
    
    const context = `Analyze this sales data and provide insights and recommendations:
      ${JSON.stringify(salesData, null, 2)}`;
    
    const analysis = await this.aiEngine.analyzeBusinessProcess(context);
    
    return analysis;
  }
}

module.exports = SalesAutomation;
