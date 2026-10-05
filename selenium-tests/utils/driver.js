const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/test.config');

async function createDriver() {
  const options = new chrome.Options();
  
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-extensions');
  options.addArguments('--allow-insecure-localhost');

  if (config.headless) {
    options.addArguments('--headless=new');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: config.implicitWaitMs });
  return driver;
}

module.exports = { createDriver };
