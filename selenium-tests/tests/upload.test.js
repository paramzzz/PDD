const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const ScanCenterPage = require('../pages/ScanCenterPage');
const UploadPage = require('../pages/UploadPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');
const { ensureSampleFiles } = require('../utils/sampleGenerator');

describe('🚀 Module 6: Medical Document Upload Workflow', function () {
  this.timeout(90000);
  let driver;
  let loginPage;
  let scanCenterPage;
  let uploadPage;
  let viewerPage;
  let sampleFiles;

  before(async function () {
    sampleFiles = ensureSampleFiles();
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    scanCenterPage = new ScanCenterPage(driver);
    uploadPage = new UploadPage(driver);
    viewerPage = new ViewerPage(driver);
    
    await loginPage.open();
    await scanCenterPage.openScanCenter();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-UPL-01: Upload Medical Document & Auto-Open Intelligence Viewer', async function () {
    const startTime = Date.now();
    try {
      await uploadPage.uploadFile(sampleFiles.jpgPath, 1, 'Prescription');
      
      const duration = Date.now() - startTime;
      excelReporter.recordMetric('uploadTimes', duration);

      const isViewerOpen = await viewerPage.isModalVisible();
      expect(isViewerOpen).to.be.true;

      const screenshot = await captureScreenshot(driver, 'TC-UPL-01_Upload', 'pass');

      excelReporter.addResult({
        testId: 'TC-UPL-01',
        module: 'Upload',
        testName: 'Upload Prescription Document',
        expected: 'Document uploaded & AI Intelligence viewer auto-opened',
        actual: 'Upload completed cleanly in multi-step progress',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-UPL-01', 'Document upload completed', duration);

      await viewerPage.closeViewer();
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-UPL-01_Upload', 'fail');
      excelReporter.addResult({
        testId: 'TC-UPL-01',
        module: 'Upload',
        testName: 'Upload Prescription Document',
        expected: 'Upload completed cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-UPL-01', e, duration);
      throw e;
    }
  });
});
