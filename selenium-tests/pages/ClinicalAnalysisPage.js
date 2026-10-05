const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ClinicalAnalysisPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainFrame = By.id('mainFrame');
  }

  async openPatientAnalysis(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
      if (typeof detTab === 'function') detTab('ai-analysis');
    `);
    await this.sleep(800);
  }

  async verifyProcessing() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyClinicalSummary() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyExtractedInformation() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async verifyAnalysisCompleted() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = ClinicalAnalysisPage;
