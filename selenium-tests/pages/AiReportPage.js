const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class AIReportPage {
  constructor(driver) {
    this.driver = driver;
    this.container = By.id('mdms-viewer-tab-content');
  }

  async getAiReportText() {
    const el = await this.driver.wait(until.elementLocated(this.container), config.explicitWaitMs);
    return await el.getText();
  }

  async verifyReportComponents() {
    const text = await this.getAiReportText();
    return {
      hasBundleSummary: text.includes('AI BUNDLE CLINICAL INTELLIGENCE SUMMARY'),
      hasApprovalDecision: text.includes('AUTOMATED TREATMENT APPROVAL'),
      hasRiskScore: text.includes('AI RISK SCORING ENGINE'),
      hasDiagnosis: text.includes('Primary Diagnosis'),
      hasSymptoms: text.includes('Symptoms Detected')
    };
  }
}

module.exports = AIReportPage;
