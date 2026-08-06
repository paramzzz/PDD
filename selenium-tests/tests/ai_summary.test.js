const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const AIReportPage = require('../pages/AIReportPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🧠 AI Clinical Intelligence Summary', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let aiReportPage;
  let viewerPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    aiReportPage = new AIReportPage(driver);
    viewerPage = new ViewerPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-AI-01: Verify AI Bundle Clinical Summary & Multi-Doc Synthesis', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      const res = await aiReportPage.verifyReportComponents();

      expect(res.hasBundleSummary).to.be.true;
      expect(res.hasApprovalDecision).to.be.true;
      expect(res.hasRiskScore).to.be.true;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-AI-01_Report', 'pass');

      excelReporter.addResult({
        testId: 'TC-AI-01',
        module: 'AI Summary',
        testName: 'Verify AI Clinical Summary Report',
        expected: 'AI Bundle Summary & Case Intelligence Report renders cleanly',
        actual: 'Multi-document AI bundle summary & components verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-AI-01', 'AI Clinical Summary verified', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-AI-01_Report', 'fail');
      excelReporter.addResult({
        testId: 'TC-AI-01',
        module: 'AI Summary',
        testName: 'Verify AI Clinical Summary Report',
        expected: 'Report renders cleanly',
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
