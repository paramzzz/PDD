const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🖼️ Module 9: Streamlined Medical Viewer & Controls', function () {
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

  it('TC-VIE-01: Verify Toolbar Controls (Zoom, Rotate, Reset)', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      
      await viewerPage.zoomIn();
      await viewerPage.zoomOut();
      await viewerPage.rotate();
      await viewerPage.reset();

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-VIE-01_Controls', 'pass');

      excelReporter.addResult({
        testId: 'TC-VIE-01',
        module: 'Viewer',
        testName: 'Verify Viewer Controls',
        expected: 'Zoom, Rotate, and Reset controls execute cleanly',
        actual: 'Toolbar controls executed without error',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-VIE-01', 'Viewer controls verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-VIE-01_Controls', 'fail');
      excelReporter.addResult({
        testId: 'TC-VIE-01',
        module: 'Viewer',
        testName: 'Verify Viewer Controls',
        expected: 'Viewer controls execute cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-VIE-01', e, duration);
      throw e;
    }
  });

  it('TC-VIE-02: Verify Corner Close Button Dismisses Modal', async function () {
    const startTime = Date.now();
    try {
      const isVisibleBefore = await viewerPage.isModalVisible();
      expect(isVisibleBefore).to.be.true;

      await viewerPage.clickCloseButton();
      
      const isVisibleAfter = await viewerPage.isModalVisible();
      expect(isVisibleAfter).to.be.false;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-VIE-02_CloseBtn', 'pass');

      excelReporter.addResult({
        testId: 'TC-VIE-02',
        module: 'Viewer',
        testName: 'Verify Corner Close Button',
        expected: 'Corner close button dismisses viewer modal',
        actual: 'Modal dismissed cleanly on button click',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-VIE-02', 'Corner close button verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-VIE-02_CloseBtn', 'fail');
      excelReporter.addResult({
        testId: 'TC-VIE-02',
        module: 'Viewer',
        testName: 'Verify Corner Close Button',
        expected: 'Close button dismisses modal',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-VIE-02', e, duration);
      throw e;
    }
  });
});
