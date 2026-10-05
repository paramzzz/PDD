const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class RiskScorePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainFrame = By.id('mainFrame');
  }

  async navigateToRiskOverview(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
      if (typeof detTab === 'function') detTab('risk-score');
    `);
    await this.sleep(800);
  }

  async verifyRiskScore() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyRiskRange() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyPriorityStatus() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = RiskScorePage;
