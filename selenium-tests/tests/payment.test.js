const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PaymentPage = require('../pages/PaymentPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('I. Payment & Finance Clearance Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let paymentPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    paymentPage = new PaymentPage(driver);
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

  it('TC-PAY-01: Verify Billing & Finance Clearance Status', async function () {
    const start = Date.now();
    try {
      await paymentPage.openPaymentDetails(1);
      const isPay = await paymentPage.verifyPaymentStatus();
      expect(isPay).to.be.true;
      recordTest('Payment & Finance', 'TC-PAY-01: Verify Billing & Finance Clearance Status', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Payment & Finance', 'TC-PAY-01: Verify Billing & Finance Clearance Status', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
