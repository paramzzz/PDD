const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('📄 PDF Document Viewer & Iframe', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let viewerPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    viewerPage = new ViewerPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-PDF-01: Verify PDF Document Viewer Rendering', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(2); // PDF document ID
      const isVisible = await viewerPage.isModalVisible();
      expect(isVisible).to.be.true;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PDF-01_Viewer', 'pass');

      excelReporter.addResult({
        testId: 'TC-PDF-01',
        module: 'PDF Viewer',
        testName: 'Verify PDF Viewer Rendering',
        expected: 'PDF document renders in viewer modal',
        actual: 'PDF document preview modal verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-PDF-01', 'PDF Viewer verified', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PDF-01_Viewer', 'fail');
      excelReporter.addResult({
        testId: 'TC-PDF-01',
        module: 'PDF Viewer',
        testName: 'Verify PDF Viewer Rendering',
        expected: 'PDF renders cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-PDF-01', e, duration);
      throw e;
    }
  });
});
