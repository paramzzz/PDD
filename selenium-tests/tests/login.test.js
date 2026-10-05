const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');
const testData = require('../utils/testData');

describe('A. Authentication Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await captureScreenshot(driver, this.currentTest.title, true);
    }
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-AUTH-01: Verify Login Page Loads Successfully', async function () {
    const start = Date.now();
    try {
      await loginPage.openLoginPage();
      const isVisible = await loginPage.isDisplayed(loginPage.loginPage);
      expect(isVisible).to.be.true;
      recordTest('Authentication', 'TC-AUTH-01: Verify Login Page Loads Successfully', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Authentication', 'TC-AUTH-01: Verify Login Page Loads Successfully', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-AUTH-02: Verify Doctor Login with Valid Credentials', async function () {
    const start = Date.now();
    try {
      await loginPage.login(testData.doctorCredentials.email, testData.doctorCredentials.password, 'DOCTOR');
      const isSuccess = await loginPage.verifyLoginSuccess();
      expect(isSuccess).to.be.true;
      recordTest('Authentication', 'TC-AUTH-02: Verify Doctor Login with Valid Credentials', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Authentication', 'TC-AUTH-02: Verify Doctor Login with Valid Credentials', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-AUTH-03: Verify Nurse Login with Valid Credentials', async function () {
    const start = Date.now();
    try {
      await loginPage.login(testData.nurseCredentials.email, testData.nurseCredentials.password, 'NURSE');
      const isSuccess = await loginPage.verifyLoginSuccess();
      expect(isSuccess).to.be.true;
      recordTest('Authentication', 'TC-AUTH-03: Verify Nurse Login with Valid Credentials', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Authentication', 'TC-AUTH-03: Verify Nurse Login with Valid Credentials', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });

  it('TC-AUTH-04: Verify Login Failure with Invalid Credentials', async function () {
    const start = Date.now();
    try {
      await loginPage.login(testData.invalidCredentials.email, testData.invalidCredentials.password, 'DOCTOR');
      const isErr = await loginPage.verifyLoginError();
      expect(isErr).to.be.true;
      recordTest('Authentication', 'TC-AUTH-04: Verify Login Failure with Invalid Credentials', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Authentication', 'TC-AUTH-04: Verify Login Failure with Invalid Credentials', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
