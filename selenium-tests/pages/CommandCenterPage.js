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
    const page = await this.driver.findElement(By.id('page-command'));
    const display = await page.getCssValue('display');
    return display !== 'none';
  }
}

module.exports = CommandCenterPage;
