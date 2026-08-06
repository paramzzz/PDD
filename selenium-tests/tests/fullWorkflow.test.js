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

describe('🏥 Module 12: End-to-End Enterprise Clinical Intelligence Journey', function () {
  this.timeout(120000);
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
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-E2E-01: Execute Full E2E Multi-Doc Journey (Upload -> Multi-Doc AI Assessment -> Approval Decision)', async function () {
    const startTime = Date.now();
    try {
      // 1. Login as Doctor
      await loginPage.loginAsDoctor('Dr. Sarah Wilson');
      
      // 2. Open Scan Center
      await scanCenterPage.openScanCenter();
      
      // 3. Upload Document
      await uploadPage.uploadFile(sampleFiles.jpgPath, 1, 'ECG');

      // 4. Verify AI Viewer opens with Case Intelligence
      const isViewerOpen = await viewerPage.isModalVisible();
      expect(isViewerOpen).to.be.true;

      const reportText = await viewerPage.getAiClinicalSummaryText();
      expect(reportText).to.include('AI BUNDLE CLINICAL INTELLIGENCE SUMMARY');
      expect(reportText).to.include('AUTOMATED TREATMENT APPROVAL');

      // 5. Test Corner Close Button
      await viewerPage.clickCloseButton();
      const isClosed = await viewerPage.isModalVisible();
      expect(isClosed).to.be.false;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-E2E-01_FullJourney', 'pass');

      excelReporter.addResult({
        testId: 'TC-E2E-01',
        module: 'End-to-End Workflow',
        testName: 'Full Multi-Doc Clinical Journey',
        expected: 'Full end-to-end journey executes cleanly without error',
        actual: 'Full clinical journey executed with 100% success',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-E2E-01', 'Full End-to-End Clinical Journey PASS', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-E2E-01_FullJourney', 'fail');
      excelReporter.addResult({
        testId: 'TC-E2E-01',
        module: 'End-to-End Workflow',
        testName: 'Full Multi-Doc Clinical Journey',
        expected: 'Full journey executes cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-E2E-01', e, duration);
      throw e;
    }
  });
});
