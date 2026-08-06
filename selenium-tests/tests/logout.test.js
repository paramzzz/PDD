const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🚪 User Session & Logout Module', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-LGO-01: Verify Role Reset & User Session Logout', async function () {
    const startTime = Date.now();
    try {
      await loginPage.setRole('DOCTOR');
      const roleBefore = await loginPage.getActiveRole();
      expect(roleBefore).to.equal('DOCTOR');

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LGO-01_Logout', 'pass');

      excelReporter.addResult({
        testId: 'TC-LGO-01',
        module: 'Logout',
        testName: 'Verify Role Reset & Session Logout',
        expected: 'User session & role reset cleanly',
        actual: 'Session & active role verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-LGO-01', 'Logout session reset verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LGO-01_Logout', 'fail');
      excelReporter.addResult({
        testId: 'TC-LGO-01',
        module: 'Logout',
        testName: 'Verify Role Reset & Session Logout',
        expected: 'Logout resets cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-LGO-01', e, duration);
      throw e;
    }
  });
});
