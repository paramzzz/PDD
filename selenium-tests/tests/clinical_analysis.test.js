const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const ClinicalAnalysisPage = require('../pages/ClinicalAnalysisPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('E. Clinical Analysis & Processing Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let clinicalPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    clinicalPage = new ClinicalAnalysisPage(driver);
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

  it('TC-CLI-01: Verify AI Clinical Summary Generation', async function () {
    const start = Date.now();
    try {
      await clinicalPage.openPatientAnalysis(1);
      const isSummary = await clinicalPage.verifyClinicalSummary();
      expect(isSummary).to.be.true;
      recordTest('Clinical Analysis', 'TC-CLI-01: Verify AI Clinical Summary Generation', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Clinical Analysis', 'TC-CLI-01: Verify AI Clinical Summary Generation', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-CLI-02: Verify Extracted Clinical Information & Vitals', async function () {
    const start = Date.now();
    try {
      await clinicalPage.openPatientAnalysis(1);
      const isExtracted = await clinicalPage.verifyExtractedInformation();
      expect(isExtracted).to.be.true;
      recordTest('Clinical Analysis', 'TC-CLI-02: Verify Extracted Clinical Information & Vitals', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Clinical Analysis', 'TC-CLI-02: Verify Extracted Clinical Information & Vitals', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
