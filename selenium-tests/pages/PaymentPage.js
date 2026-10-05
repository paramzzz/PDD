const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PaymentPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainFrame = By.id('mainFrame');
  }

  async openPaymentDetails(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
      if (typeof detTab === 'function') detTab('insurance');
    `);
    await this.sleep(800);
  }

  async verifyPaymentStatus() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyPendingAmount() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyBillingInformation() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = PaymentPage;
