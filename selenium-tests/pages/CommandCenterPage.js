const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class CommandCenterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async openCommandCenter() {
    await this.driver.executeScript("navTo('command')");
    await this.driver.sleep(300);
  }

  async isCommandCenterVisible() {
    try {
      const page = await this.driver.wait(until.elementLocated(By.id('page-command')), config.explicitWaitMs);
      return page !== null;
    } catch (e) {
      return false;
    }
  }
}

module.exports = CommandCenterPage;
