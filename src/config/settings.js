module.exports = {
  business: {
    name: process.env.BUSINESS_NAME || 'AI Automated Business',
    email: process.env.BUSINESS_EMAIL || 'contact@business.com',
    timezone: 'UTC'
  },
  
  automation: {
    autoResponseEnabled: process.env.AUTO_RESPONSE_ENABLED === 'true',
    autoProcessDocuments: process.env.AUTO_PROCESS_DOCUMENTS === 'true',
    autoGenerateReports: process.env.AUTO_GENERATE_REPORTS === 'true'
  },
  
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1500
  },
  
  workflows: {
    dailyReports: {
      enabled: true,
      schedule: '0 9 * * *', // 9 AM daily
      recipients: []
    },
    weeklyAnalysis: {
      enabled: true,
      schedule: '0 9 * * 1', // 9 AM Monday
      recipients: []
    },
    monthlyForecasts: {
      enabled: true,
      schedule: '0 9 1 * *', // 9 AM 1st of month
      recipients: []
    }
  },
  
  thresholds: {
    leadScoreHigh: 70,
    leadScoreMedium: 40,
    inventoryReorderMultiplier: 1.5,
    cashFlowWarningDays: 30
  }
};
