const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ScanCenterPage = require('../pages/ScanCenterPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🔍 Module 10: Multi-Field Search & Analytics', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let scanCenterPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    scanCenterPage = new ScanCenterPage(driver);
    await loginPage.open();
    await scanCenterPage.openScanCenter();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-SCH-01: Execute Multi-Field Clinical Search', async function () {
    const startTime = Date.now();
    try {
      await scanCenterPage.searchDocuments('Ravi');
      const duration = Date.now() - startTime;
      excelReporter.recordMetric('apiResponseTimes', duration);

      const screenshot = await captureScreenshot(driver, 'TC-SCH-01_Search', 'pass');

      excelReporter.addResult({
        testId: 'TC-SCH-01',
        module: 'Search',
        testName: 'Multi-Field Clinical Search',
        expected: 'Search returns filtered records',
        actual: 'Multi-field search returned cleanly',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-SCH-01', 'Search query executed', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-SCH-01_Search', 'fail');
      excelReporter.addResult({
        testId: 'TC-SCH-01',
        module: 'Search',
        testName: 'Multi-Field Clinical Search',
        expected: 'Search returns cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-SCH-01', e, duration);
      throw e;
    }
  });
});
