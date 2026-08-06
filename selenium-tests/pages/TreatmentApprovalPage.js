const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class TreatmentApprovalPage {
  constructor(driver) {
    this.driver = driver;
    this.container = By.id('mdms-viewer-tab-content');
  }

  async getApprovalRecommendation() {
    const el = await this.driver.wait(until.elementLocated(this.container), config.explicitWaitMs);
    const text = await el.getText();
    if (text.includes('EMERGENCY FAST TRACK')) return 'EMERGENCY FAST TRACK';
    if (text.includes('APPROVED')) return 'APPROVED';
    if (text.includes('REQUIRES DOCTOR REVIEW')) return 'REQUIRES DOCTOR REVIEW';
    return 'APPROVAL PENDING';
  }
}

module.exports = TreatmentApprovalPage;
