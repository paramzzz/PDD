const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const TreatmentApprovalPage = require('../pages/TreatmentApprovalPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('K. Treatment Approval Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let approvalPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    approvalPage = new TreatmentApprovalPage(driver);
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

  it('TC-APP-01: Verify Automated Treatment Approval Recommendation', async function () {
    const start = Date.now();
    try {
      await approvalPage.openApprovalCenter(1);
      const isRec = await approvalPage.verifyApprovalRecommendation();
      expect(isRec).to.be.true;
      recordTest('Treatment Approval', 'TC-APP-01: Verify Automated Treatment Approval Recommendation', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Treatment Approval', 'TC-APP-01: Verify Automated Treatment Approval Recommendation', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
