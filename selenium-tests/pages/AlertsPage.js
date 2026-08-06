const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class AlertsPage {
  constructor(driver) {
    this.driver = driver;
  }

  async openAlerts() {
    await this.driver.executeScript("navTo('alerts')");
    await this.driver.sleep(300);
  }

  async isAlertsVisible() {
    const page = await this.driver.findElement(By.id('page-alerts'));
    const display = await page.getCssValue('display');
    return display !== 'none';
  }
}

module.exports = AlertsPage;
