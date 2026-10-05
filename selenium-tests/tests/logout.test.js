const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('O. Logout & Session Termination Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
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

  it('TC-LOGOUT-01: User Sign Out & Session Termination', async function () {
    const start = Date.now();
    try {
      await driver.executeScript(`
        if (typeof doLogout === 'function') doLogout();
      `);
      await driver.sleep(1000);
      const isLoginVisible = await loginPage.isDisplayed(loginPage.loginPage);
      expect(isLoginVisible).to.be.true;
      recordTest('Logout', 'TC-LOGOUT-01: User Sign Out & Session Termination', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Logout', 'TC-LOGOUT-01: User Sign Out & Session Termination', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
