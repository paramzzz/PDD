const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class DashboardPage {
  constructor(driver) {
    this.driver = driver;
    this.criticalStatNum = By.id('ds-stat');
    this.pendingStatNum = By.id('ds-pending');
    this.clearedStatNum = By.id('ds-cleared');
    this.avgTimeStatNum = By.id('ds-active');
    
    this.navHome = By.id('nb-home');
    this.navPatients = By.id('nb-patients');
    this.navCareTeam = By.id('nb-careteam');
    this.navScan = By.id('nb-scan');
    this.navCommand = By.id('nb-command');
    this.navAlerts = By.id('nb-alerts');
    this.navProfile = By.id('nb-profile');
  }

  async navigateToTab(tabName) {
    const tabIdMap = {
      'home': 'nb-home',
      'patients': 'nb-patients',
      'careteam': 'nb-careteam',
      'scan': 'nb-scan',
      'command': 'nb-command',
      'alerts': 'nb-alerts',
      'profile': 'nb-profile'
    };

    const targetId = tabIdMap[tabName.toLowerCase()] || 'nb-home';
    await this.driver.executeScript(`navTo('${tabName.toLowerCase()}')`);
    await this.driver.sleep(300);
  }

  async getCriticalCount() {
    const el = await this.driver.findElement(this.criticalStatNum);
    return await el.getText();
  }

  async getPendingCount() {
    const el = await this.driver.findElement(this.pendingStatNum);
    return await el.getText();
  }

  async getClearedCount() {
    const el = await this.driver.findElement(this.clearedStatNum);
    return await el.getText();
  }

  async getAvgTime() {
    const el = await this.driver.findElement(this.avgTimeStatNum);
    return await el.getText();
  }
}

module.exports = DashboardPage;
