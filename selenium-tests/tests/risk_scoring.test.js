const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const RiskScorePage = require('../pages/RiskScorePage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('F. Risk Scoring Test Suite', function () {
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

  it('TC-RISK-01: Verify Clinical Risk Score Generation & Range', async function () {
    const start = Date.now();
    try {
      await riskPage.navigateToRiskOverview();
      const isScore = await riskPage.verifyRiskScore();
      expect(isScore).to.be.true;
      recordTest('Risk Scoring', 'TC-RISK-01: Verify Clinical Risk Score Generation & Range', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Risk Scoring', 'TC-RISK-01: Verify Clinical Risk Score Generation & Range', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
