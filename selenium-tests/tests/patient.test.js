const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PatientPage = require('../pages/PatientPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');
const testData = require('../utils/testData');

describe('C. Patient Management Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let patientPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    patientPage = new PatientPage(driver);
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

  it('TC-PAT-01: Create New Synthetic Patient Record', async function () {
    const start = Date.now();
    try {
      await patientPage.createPatient(testData.syntheticPatient);
      const isVerified = await patientPage.verifyPatientDetails();
      expect(isVerified).to.be.true;
      recordTest('Patient Management', 'TC-PAT-01: Create New Synthetic Patient Record', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Patient Management', 'TC-PAT-01: Create New Synthetic Patient Record', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-PAT-02: Open Existing Patient Case Details', async function () {
    const start = Date.now();
    try {
      await patientPage.openPatient(1);
      const isVerified = await patientPage.verifyPatientDetails();
      expect(isVerified).to.be.true;
      recordTest('Patient Management', 'TC-PAT-02: Open Existing Patient Case Details', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Patient Management', 'TC-PAT-02: Open Existing Patient Case Details', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
