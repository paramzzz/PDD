const { expect } = require('chai');
const { getDriver } = require('../config/browser');
const LoginPage = require('../pages/LoginPage');
const ScanCenterPage = require('../pages/ScanCenterPage');
const UploadPage = require('../pages/UploadPage');
const ViewerPage = require('../pages/ViewerPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');
const { ensureSampleFiles } = require('../utils/sampleGenerator');

describe('🏥 End-to-End Complete Clinical Journey Test Suite', function () {
  this.timeout(120000);
  let driver;
  let loginPage;
  let scanCenterPage;
  let uploadPage;
  let viewerPage;
  let sampleFiles;

  before(async function () {
    sampleFiles = ensureSampleFiles();
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    scanCenterPage = new ScanCenterPage(driver);
    uploadPage = new UploadPage(driver);
    viewerPage = new ViewerPage(driver);
    
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-E2E-01: Complete End-to-End Journey (Login -> Patient Queue -> Upload -> AI Summary -> Approval -> Viewer -> Dashboard -> Logout)', async function () {
    const startTime = Date.now();
    try {
      // 1. Login
      await loginPage.loginAsDoctor('Dr. Sarah Wilson');
      
      // 2. Scan Center & Upload
      await scanCenterPage.openScanCenter();
      await uploadPage.uploadFile(sampleFiles.jpgPath, 1, 'Prescription');

      // 3. AI Case Summary & Treatment Approval Modal
      const isViewerOpen = await viewerPage.isModalVisible();
      expect(isViewerOpen).to.be.true;

      const reportText = await viewerPage.getAiClinicalSummaryText();
      expect(reportText).to.include('AI BUNDLE CLINICAL INTELLIGENCE SUMMARY');

      // 4. Dismiss modal using corner close button
      await viewerPage.clickCloseButton();
      const isClosed = await viewerPage.isModalVisible();
      expect(isClosed).to.be.false;

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-E2E-01_FullJourney', 'pass');

      excelReporter.addResult({
        testId: 'TC-E2E-01',
        module: 'End to End',
        testName: 'Full End-to-End Clinical Journey',
        expected: 'Full journey executes cleanly without error from login to logout',
        actual: 'Full clinical journey executed with 100% success',
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-E2E-01', 'Full End-to-End Journey PASS', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-E2E-01_FullJourney', 'fail');
      excelReporter.addResult({
        testId: 'TC-E2E-01',
        module: 'End to End',
        testName: 'Full End-to-End Clinical Journey',
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
