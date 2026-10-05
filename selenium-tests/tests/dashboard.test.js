const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('L. Executive Dashboard Test Suite', function () {
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

  it('TC-DASH-01: Verify Executive Telemetry & Stat Cards', async function () {
    const start = Date.now();
    try {
      await dashboardPage.navigateToDashboard();
      const isLoaded = await dashboardPage.verifyDashboardLoaded();
      expect(isLoaded).to.be.true;
      recordTest('Dashboard', 'TC-DASH-01: Verify Executive Telemetry & Stat Cards', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Dashboard', 'TC-DASH-01: Verify Executive Telemetry & Stat Cards', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-DASH-02: Verify AI Copilot Query Interaction', async function () {
    const start = Date.now();
    try {
      await dashboardPage.askCopilot('patient status summary');
      const isLoaded = await dashboardPage.verifyDashboardLoaded();
      expect(isLoaded).to.be.true;
      recordTest('Dashboard', 'TC-DASH-02: Verify AI Copilot Query Interaction', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Dashboard', 'TC-DASH-02: Verify AI Copilot Query Interaction', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
