const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🧩 Module 2: Bottom Navigation Bar', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let dashboardPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  const tabs = ['home', 'patients', 'careteam', 'scan', 'command', 'alerts', 'profile'];

  tabs.forEach((tab, index) => {
    const testId = `TC-NAV-0${index + 1}`;
    it(`${testId}: Navigate to Tab '${tab.toUpperCase()}'`, async function () {
      const startTime = Date.now();
      try {
        await dashboardPage.navigateToTab(tab);
        const duration = Date.now() - startTime;
        const screenshot = await captureScreenshot(driver, `${testId}_${tab}`, 'pass');

        excelReporter.addResult({
          testId,
          module: 'Navigation',
          testName: `Navigate to ${tab.toUpperCase()}`,
          expected: `Tab ${tab.toUpperCase()} opens successfully`,
          actual: `Tab ${tab.toUpperCase()} loaded cleanly`,
          status: 'PASS',
          duration,
          screenshot
        });
        logger.pass(testId, `Navigation to ${tab} PASS`, duration);
      } catch (e) {
        const duration = Date.now() - startTime;
        const screenshot = await captureScreenshot(driver, `${testId}_${tab}`, 'fail');
        excelReporter.addResult({
          testId,
          module: 'Navigation',
          testName: `Navigate to ${tab.toUpperCase()}`,
          expected: `Tab ${tab.toUpperCase()} opens cleanly`,
          actual: e.message,
          status: 'FAIL',
          duration,
          screenshot
        });
        logger.fail(testId, e, duration);
        throw e;
      }
    });
  });
});
