const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class AiReportPage {
  constructor(driver) {
    this.driver = driver;
    this.container = By.id('mdms-viewer-tab-content');
  }

  async getAiReportText() {
    const el = await this.driver.wait(until.elementLocated(this.container), config.explicitWaitMs);
    return await el.getText();
  }

  async isReportRendered() {
    const text = await this.getAiReportText();
    return text.includes('AI BUNDLE CLINICAL INTELLIGENCE SUMMARY') && text.includes('AUTOMATED TREATMENT APPROVAL');
  }
}

module.exports = AiReportPage;
