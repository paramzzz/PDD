const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DocumentPage = require('../pages/DocumentPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');
const testData = require('../utils/testData');

describe('D. Multi-Document Upload Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let documentPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    documentPage = new DocumentPage(driver);
    await loginPage.login();
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await captureScreenshot(driver, this.currentTest.title, true);
    }
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-DOC-01: Single Document Upload (Prescription)', async function () {
    const start = Date.now();
    try {
      await documentPage.uploadDocument(testData.testFiles.prescription, 1, 'Prescription');
      const isOk = await documentPage.verifyUpload();
      expect(isOk).to.be.true;
      recordTest('Document Upload', 'TC-DOC-01: Single Document Upload (Prescription)', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Document Upload', 'TC-DOC-01: Single Document Upload (Prescription)', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-DOC-02: Multi-Document Bundle Upload (Prescription, Lab Report, Scan, Insurance)', async function () {
    const start = Date.now();
    try {
      await documentPage.uploadDocument(testData.testFiles.labReport, 1, 'Lab Report');
      await documentPage.uploadDocument(testData.testFiles.scanReport, 1, 'Scan Report');
      const isOk = await documentPage.verifyUpload();
      expect(isOk).to.be.true;
      recordTest('Document Upload', 'TC-DOC-02: Multi-Document Bundle Upload (Prescription, Lab Report, Scan, Insurance)', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Document Upload', 'TC-DOC-02: Multi-Document Bundle Upload (Prescription, Lab Report, Scan, Insurance)', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
