const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class ProfilePage {
  constructor(driver) {
    this.driver = driver;
  }

  async openProfile() {
    await this.driver.executeScript("navTo('profile')");
    await this.driver.sleep(300);
  }

  async isProfileVisible() {
    const page = await this.driver.findElement(By.id('page-profile'));
    const display = await page.getCssValue('display');
    return display !== 'none';
  }
}

module.exports = ProfilePage;
