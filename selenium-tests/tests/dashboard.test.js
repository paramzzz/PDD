const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('📊 Module 3: Executive Dashboard Telemetry', function () {
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

  it('TC-DASH-01: Verify Executive Telemetry Stat Cards', async function () {
    const startTime = Date.now();
    try {
      await dashboardPage.navigateToTab('home');
      
      const critical = await dashboardPage.getCriticalCount();
      const pending = await dashboardPage.getPendingCount();
      const cleared = await dashboardPage.getClearedCount();

      expect(critical).to.not.be.empty;
      expect(pending).to.not.be.empty;
      expect(cleared).to.not.be.empty;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-DASH-01_Stats', 'pass');

      excelReporter.addResult({
        testId: 'TC-DASH-01',
        module: 'Dashboard',
        testName: 'Verify Stat Cards',
        expected: 'Telemetry stat cards render real-time values',
        actual: `Critical=${critical}, Pending=${pending}, Cleared=${cleared}`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-DASH-01', 'Dashboard stats verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-DASH-01_Stats', 'fail');
      excelReporter.addResult({
        testId: 'TC-DASH-01',
        module: 'Dashboard',
        testName: 'Verify Stat Cards',
        expected: 'Telemetry cards render cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-DASH-01', e, duration);
      throw e;
    }
  });
});
