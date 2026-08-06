const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const TreatmentApprovalPage = require('../pages/TreatmentApprovalPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🎯 Automated Treatment Approval Engine', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let approvalPage;
  let viewerPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    approvalPage = new TreatmentApprovalPage(driver);
    viewerPage = new ViewerPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-APP-01: Verify AI Treatment Recommendation Decision & Confidence', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      const rec = await approvalPage.getApprovalRecommendation();

      expect(rec).to.be.oneOf(['EMERGENCY FAST TRACK', 'APPROVED', 'REQUIRES DOCTOR REVIEW']);

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-APP-01_Decision', 'pass');

      excelReporter.addResult({
        testId: 'TC-APP-01',
        module: 'Treatment Approval',
        testName: 'Verify AI Approval Recommendation',
        expected: 'Valid treatment approval decision badge renders',
        actual: `Recommendation verified: ${rec}`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-APP-01', `Approval decision verified: ${rec}`, duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-APP-01_Decision', 'fail');
      excelReporter.addResult({
        testId: 'TC-APP-01',
        module: 'Treatment Approval',
        testName: 'Verify AI Approval Recommendation',
        expected: 'Recommendation renders cleanly',
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
