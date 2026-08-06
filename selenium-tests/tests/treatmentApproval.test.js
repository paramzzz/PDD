const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🎯 Module 8: Automated Treatment Approval Engine', function () {
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

  it('TC-APP-01: Verify Treatment Approval Decision & Confidence %', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      const text = await viewerPage.getAiClinicalSummaryText();

      const hasValidDecision = text.includes('EMERGENCY FAST TRACK') || 
                               text.includes('APPROVED') || 
                               text.includes('REQUIRES DOCTOR REVIEW') ||
                               text.includes('WAITING FOR INSURANCE');
      expect(hasValidDecision).to.be.true;
      expect(text).to.include('AI Confidence:');

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-APP-01_Decision', 'pass');

      excelReporter.addResult({
        testId: 'TC-APP-01',
        module: 'Treatment Approval',
        testName: 'Verify Automated Approval Decision',
        expected: 'Automated Treatment Approval badge & confidence score render',
        actual: 'Approval decision & AI confidence verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-APP-01', 'Treatment Approval decision verified', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-APP-01_Decision', 'fail');
      excelReporter.addResult({
        testId: 'TC-APP-01',
        module: 'Treatment Approval',
        testName: 'Verify Automated Approval Decision',
        expected: 'Approval decision renders cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-APP-01', e, duration);
      throw e;
    }
  });
});
