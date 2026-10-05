const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.homeNavBtn = By.id('nb-home');
    this.mainFrame = By.id('mainFrame');
    this.statCards = By.css('.stat-card');
    this.criticalCards = By.css('.badge-stat, .badge-high, [id^="ds-critical"]');
    this.copilotBtn = By.id('copilot-btn');
    this.copilotPanel = By.id('copilot-panel');
    this.copilotInput = By.id('copilot-input');
  }

  async navigateToDashboard() {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('home');
    `);
    await this.sleep(800);
  }

  async verifyDashboardLoaded() {
    return await this.isDisplayed(this.mainFrame);
  }

  async getCriticalPatients() {
    return await this.findAll(this.criticalCards);
  }

  async getPendingApprovals() {
    return await this.findAll(By.css('.badge-orange, .badge-med, [id*="pending"]'));
  }

  async verifyEmergencyAlerts() {
    const text = await this.getText(this.mainFrame);
    return text.includes('CRITICAL') || text.includes('STAT') || text.includes('Emergency') || text.includes('Alert');
  }

  async openPatientCase(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
    `);
    await this.sleep(1000);
  }

  async openCopilot() {
    await this.executeScript(`
      if (typeof toggleCopilot === 'function') toggleCopilot();
    `);
    await this.sleep(500);
  }

  async askCopilot(query) {
    await this.openCopilot();
    await this.type(this.copilotInput, query);
    await this.executeScript(`
      if (typeof sendCopilot === 'function') sendCopilot();
    `);
    await this.sleep(1500);
  }
}

module.exports = DashboardPage;
