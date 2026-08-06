const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🖼️ Image Viewer & Controls', function () {
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

  it('TC-IMG-01: Verify Image Viewer Toolbar Controls & Corner Close', async function () {
    const startTime = Date.now();
    try {
      await viewerPage.openViewerForDocument(1);
      
      await viewerPage.zoomIn();
      await viewerPage.zoomOut();
      await viewerPage.rotate();
      await viewerPage.reset();

      const isVisibleBefore = await viewerPage.isModalVisible();
      expect(isVisibleBefore).to.be.true;

      await viewerPage.clickCloseButton();
      const isVisibleAfter = await viewerPage.isModalVisible();
      expect(isVisibleAfter).to.be.false;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-IMG-01_ViewerControls', 'pass');

      excelReporter.addResult({
        testId: 'TC-IMG-01',
        module: 'Image Viewer',
        testName: 'Verify Image Viewer Controls & Close',
        expected: 'Viewer toolbar & corner close button work cleanly',
        actual: 'Toolbar controls & corner close button verified',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-IMG-01', 'Image Viewer controls verified', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-IMG-01_ViewerControls', 'fail');
      excelReporter.addResult({
        testId: 'TC-IMG-01',
        module: 'Image Viewer',
        testName: 'Verify Image Viewer Controls & Close',
        expected: 'Controls work cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-IMG-01', e, duration);
      throw e;
    }
  });
});
