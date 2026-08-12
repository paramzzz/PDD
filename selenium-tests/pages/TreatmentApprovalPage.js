const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class TreatmentApprovalPage {
  constructor(driver) {
    this.driver = driver;
    this.container = By.id('mdms-viewer-tab-content');
  }

  async getApprovalRecommendation() {
    await this.driver.wait(async () => {
      try {
        const text = await this.driver.findElement(this.container).getText();
        return text.includes('EMERGENCY FAST TRACK') || text.includes('APPROVED') || text.includes('REQUIRES DOCTOR REVIEW');
      } catch (e) {
        return false;
      }
    }, config.explicitWaitMs, 'Approval recommendation text failed to load');
    const el = await this.driver.findElement(this.container);
    const text = await el.getText();
    if (text.includes('EMERGENCY FAST TRACK')) return 'EMERGENCY FAST TRACK';
    if (text.includes('APPROVED')) return 'APPROVED';
    if (text.includes('REQUIRES DOCTOR REVIEW')) return 'REQUIRES DOCTOR REVIEW';
    return 'APPROVAL PENDING';
  }
}

module.exports = TreatmentApprovalPage;
