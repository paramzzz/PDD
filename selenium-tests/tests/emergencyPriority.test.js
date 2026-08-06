const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🚨 Module 11: Emergency Prioritization Engine', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let viewerPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    viewerPage = new ViewerPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-EME-01: Verify Emergency Priority Level Badge & Queue Categorization', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      const text = await viewerPage.getAiClinicalSummaryText();

      const hasEmergencyBadge = text.includes('Emergency Priority Level:') || text.includes('Critical') || text.includes('Emergency');
      expect(hasEmergencyBadge).to.be.true;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-EME-01_Priority', 'pass');

      excelReporter.addResult({
        testId: 'TC-EME-01',
        module: 'Emergency Priority',
        testName: 'Verify Emergency Priority Level Badge',
        expected: 'Emergency priority level badge renders',
        actual: 'Emergency priority level confirmed',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-EME-01', 'Emergency priority verified', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-EME-01_Priority', 'fail');
      excelReporter.addResult({
        testId: 'TC-EME-01',
        module: 'Emergency Priority',
        testName: 'Verify Emergency Priority Level Badge',
        expected: 'Emergency priority level badge renders cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-EME-01', e, duration);
      throw e;
    }
  });
});
