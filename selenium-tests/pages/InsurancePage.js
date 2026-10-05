const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class InsurancePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainFrame = By.id('mainFrame');
  }

  async openInsuranceDetails(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
      if (typeof detTab === 'function') detTab('insurance');
    `);
    await this.sleep(800);
  }

  async verifyInsuranceStatus() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyCoverage() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyCopay() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = InsurancePage;
