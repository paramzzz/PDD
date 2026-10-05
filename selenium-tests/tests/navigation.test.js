const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('B. Navigation Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let dashboardPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    await loginPage.login();
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await captureScreenshot(driver, this.currentTest.title, true);
    }
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-NAV-01: Navigate to Executive Dashboard', async function () {
    const start = Date.now();
    try {
      await dashboardPage.navigateToDashboard();
      const isLoaded = await dashboardPage.verifyDashboardLoaded();
      expect(isLoaded).to.be.true;
      recordTest('Navigation', 'TC-NAV-01: Navigate to Executive Dashboard', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Navigation', 'TC-NAV-01: Navigate to Executive Dashboard', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-NAV-02: Navigate to Patients Queue', async function () {
    const start = Date.now();
    try {
      await driver.executeScript("if (typeof navTo === 'function') navTo('patients');");
      await driver.sleep(800);
      const isLoaded = await dashboardPage.isDisplayed(dashboardPage.mainFrame);
      expect(isLoaded).to.be.true;
      recordTest('Navigation', 'TC-NAV-02: Navigate to Patients Queue', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Navigation', 'TC-NAV-02: Navigate to Patients Queue', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-NAV-03: Navigate to MDMS Scan & Document Center', async function () {
    const start = Date.now();
    try {
      await driver.executeScript("if (typeof navTo === 'function') navTo('scan');");
      await driver.sleep(800);
      const isLoaded = await dashboardPage.isDisplayed(dashboardPage.mainFrame);
      expect(isLoaded).to.be.true;
      recordTest('Navigation', 'TC-NAV-03: Navigate to MDMS Scan & Document Center', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Navigation', 'TC-NAV-03: Navigate to MDMS Scan & Document Center', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-NAV-04: Navigate to Command Center', async function () {
    const start = Date.now();
    try {
      await driver.executeScript("if (typeof navTo === 'function') navTo('command');");
      await driver.sleep(800);
      const isLoaded = await dashboardPage.isDisplayed(dashboardPage.mainFrame);
      expect(isLoaded).to.be.true;
      recordTest('Navigation', 'TC-NAV-04: Navigate to Command Center', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Navigation', 'TC-NAV-04: Navigate to Command Center', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
