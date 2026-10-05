const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const RiskScorePage = require('../pages/RiskScorePage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('G. Emergency Prioritization Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let riskPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    riskPage = new RiskScorePage(driver);
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

  it('TC-EME-01: Verify Emergency Priority Categorization & Badging', async function () {
    const start = Date.now();
    try {
      await riskPage.navigateToRiskOverview();
      const isPriority = await riskPage.verifyPriorityStatus();
      expect(isPriority).to.be.true;
      recordTest('Emergency Prioritization', 'TC-EME-01: Verify Emergency Priority Categorization & Badging', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Emergency Prioritization', 'TC-EME-01: Verify Emergency Priority Categorization & Badging', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
