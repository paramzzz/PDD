const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class NavigationPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(tabName) {
    await this.driver.executeScript(`navTo('${tabName.toLowerCase()}')`);
    await this.driver.sleep(350);
  }

  async isTabActive(tabName) {
    return await this.driver.executeScript(`
      const page = document.getElementById('page-${tabName.toLowerCase()}');
      return page && page.style.display !== 'none';
    `);
  }
}

module.exports = NavigationPage;
