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

  async waitForStatToPopulate(id) {
    await this.driver.wait(async () => {
      try {
        const text = await this.driver.executeScript(`
          const el = document.getElementById('${id}');
          return el ? el.innerText.trim() : '';
        `);
        return text !== '' && text !== '—';
      } catch (e) {
        return false;
      }
    }, config.explicitWaitMs, 'Dashboard stat card value failed to populate');
  }

  async getCriticalCount() {
    await this.waitForStatToPopulate('ds-stat');
    return await this.driver.executeScript("return document.getElementById('ds-stat')?.innerText.trim() || '';");
  }

  async getPendingCount() {
    await this.waitForStatToPopulate('ds-pending');
    return await this.driver.executeScript("return document.getElementById('ds-pending')?.innerText.trim() || '';");
  }

  async getClearedCount() {
    await this.waitForStatToPopulate('ds-cleared');
    return await this.driver.executeScript("return document.getElementById('ds-cleared')?.innerText.trim() || '';");
  }

  async getAvgTime() {
    await this.waitForStatToPopulate('ds-active');
    return await this.driver.executeScript("return document.getElementById('ds-active')?.innerText.trim() || '';");
  }
}

module.exports = DashboardPage;
