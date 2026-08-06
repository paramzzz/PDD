const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const CommandCenterPage = require('../pages/CommandCenterPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🎯 Hospital Command Center Module', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let commandCenterPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    commandCenterPage = new CommandCenterPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-CMD-01: Verify Hospital Command Center Page Loads', async function () {
    const startTime = Date.now();
    try {
      await commandCenterPage.openCommandCenter();
      const isVisible = await commandCenterPage.isCommandCenterVisible();
      expect(isVisible).to.be.true;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-CMD-01_CommandCenter', 'pass');

      excelReporter.addResult({
        testId: 'TC-CMD-01',
        module: 'Command Center',
        testName: 'Verify Command Center View',
        expected: 'Hospital Command Center page opens cleanly',
        actual: 'Command Center view verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-CMD-01', 'Command Center page verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-CMD-01_CommandCenter', 'fail');
      excelReporter.addResult({
        testId: 'TC-CMD-01',
        module: 'Command Center',
        testName: 'Verify Command Center View',
        expected: 'Command Center opens cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-CMD-01', e, duration);
      throw e;
    }
  });
});
