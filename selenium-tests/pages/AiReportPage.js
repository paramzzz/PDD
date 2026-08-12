const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class AIReportPage {
  constructor(driver) {
    this.driver = driver;
    this.container = By.id('mdms-viewer-tab-content');
  }

  async getAiReportText() {
    await this.driver.wait(async () => {
      try {
        const text = await this.driver.executeScript(`
          const el = document.getElementById('mdms-viewer-tab-content');
          return el ? el.innerText : '';
        `);
        return text.includes('AI BUNDLE') || text.includes('AUTOMATED TREATMENT APPROVAL') || text.includes('AI RISK SCORING');
      } catch (e) {
        return false;
      }
    }, config.explicitWaitMs, 'AI Clinical Summary text failed to load');
    return await this.driver.executeScript(`
      const el = document.getElementById('mdms-viewer-tab-content');
      return el ? el.innerText : '';
    `);
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
