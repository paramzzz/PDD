const { By, until } = require('selenium-webdriver');
const config = require('../config/test.config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.explicitWaitMs;
  }

  async open(url = config.baseUrl) {
    await this.driver.get(url);
    await this.driver.wait(until.elementLocated(By.tagName('body')), this.timeout);
  }

  async find(locator, timeout = this.timeout) {
    const el = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async findAll(locator) {
    return await this.driver.findElements(locator);
  }

  async click(locator, timeout = this.timeout) {
    const el = await this.find(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    await el.click();
  }

  async type(locator, text, timeout = this.timeout) {
    const el = await this.find(locator, timeout);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator, timeout = this.timeout) {
    const el = await this.find(locator, timeout);
    return await el.getText();
  }

  async isDisplayed(locator, timeout = 3000) {
    try {
      const el = await this.driver.wait(until.elementLocated(locator), timeout);
      return await el.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  async sleep(ms) {
    await this.driver.sleep(ms);
  }
}

module.exports = BasePage;
