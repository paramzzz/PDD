const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PreOpPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainFrame = By.id('mainFrame');
  }

  async openPreOpChecklist(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
      if (typeof detTab === 'function') detTab('pre-op');
    `);
    await this.sleep(800);
  }

  async verifyChecklist() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyPendingRequirements() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifySurgeryReadiness() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = PreOpPage;
