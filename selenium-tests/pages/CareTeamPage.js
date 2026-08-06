const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class CareTeamPage {
  constructor(driver) {
    this.driver = driver;
  }

  async openCareTeam() {
    await this.driver.executeScript("navTo('careteam')");
    await this.driver.sleep(300);
  }

  async isCareTeamVisible() {
    const page = await this.driver.findElement(By.id('page-careteam'));
    const display = await page.getCssValue('display');
    return display !== 'none';
  }
}

module.exports = CareTeamPage;
