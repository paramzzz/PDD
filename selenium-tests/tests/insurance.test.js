const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const InsurancePage = require('../pages/InsurancePage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('H. Insurance Verification Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let insurancePage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    insurancePage = new InsurancePage(driver);
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

  it('TC-INS-01: Verify Cashless Pre-Authorization Insurance Status', async function () {
    const start = Date.now();
    try {
      await insurancePage.openInsuranceDetails(1);
      const isIns = await insurancePage.verifyInsuranceStatus();
      expect(isIns).to.be.true;
      recordTest('Insurance Verification', 'TC-INS-01: Verify Cashless Pre-Authorization Insurance Status', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Insurance Verification', 'TC-INS-01: Verify Cashless Pre-Authorization Insurance Status', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
