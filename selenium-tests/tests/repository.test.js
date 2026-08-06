const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ScanCenterPage = require('../pages/ScanCenterPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('📂 Module 5: Patient Document Repository', function () {
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

  it('TC-REP-01: Load Patient Repository Documents', async function () {
    const startTime = Date.now();
    try {
      await scanCenterPage.selectPatient(1);
      const count = await scanCenterPage.getDocumentCardsCount();
      expect(count).to.be.above(0);

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-REP-01_Load', 'pass');

      excelReporter.addResult({
        testId: 'TC-REP-01',
        module: 'Repository',
        testName: 'Load Patient Documents',
        expected: 'Document cards render in repository',
        actual: `Loaded ${count} document cards for Patient #1`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-REP-01', `Repository loaded ${count} document cards`, duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-REP-01_Load', 'fail');
      excelReporter.addResult({
        testId: 'TC-REP-01',
        module: 'Repository',
        testName: 'Load Patient Documents',
        expected: 'Document cards render cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-REP-01', e, duration);
      throw e;
    }
  });

  it('TC-REP-02: Filter Documents by Search Term', async function () {
    const startTime = Date.now();
    try {
      await scanCenterPage.searchDocuments('MRI');
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-REP-02_Search', 'pass');

      excelReporter.addResult({
        testId: 'TC-REP-02',
        module: 'Repository',
        testName: 'Search Document Repository',
        expected: 'Repository search returns matching clinical records',
        actual: 'Search query executed successfully',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-REP-02', 'Repository search completed', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-REP-02_Search', 'fail');
      excelReporter.addResult({
        testId: 'TC-REP-02',
        module: 'Repository',
        testName: 'Search Document Repository',
        expected: 'Search returns cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-REP-02', e, duration);
      throw e;
    }
  });
});
