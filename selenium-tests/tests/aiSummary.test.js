const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🧠 Module 7: AI Multi-Document Case Intelligence & Clinical Summary', function () {
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

  it('TC-AI-01: Verify Multi-Document AI Bundle Summary Card & Risk Score', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      const text = await viewerPage.getAiClinicalSummaryText();

      expect(text).to.include('AI BUNDLE CLINICAL INTELLIGENCE SUMMARY');
      expect(text).to.include('AI RISK SCORING ENGINE');
      expect(text).to.include('AUTOMATED TREATMENT APPROVAL');

      const duration = Date.now() - startTime;
      excelReporter.recordMetric('viewerLoadTimes', duration);

      const screenshot = await captureScreenshot(driver, 'TC-AI-01_BundleSummary', 'pass');

      excelReporter.addResult({
        testId: 'TC-AI-01',
        module: 'AI Intelligence',
        testName: 'Verify AI Bundle Summary & Risk Engine',
        expected: 'AI Clinical Summary report renders multi-document synthesis & risk score',
        actual: 'Multi-document AI bundle summary & risk scoring verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-AI-01', 'AI Summary report verified', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-AI-01_BundleSummary', 'fail');
      excelReporter.addResult({
        testId: 'TC-AI-01',
        module: 'AI Intelligence',
        testName: 'Verify AI Bundle Summary & Risk Engine',
        expected: 'AI Summary report renders cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-AI-01', e, duration);
      throw e;
    }
  });
});
