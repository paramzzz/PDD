const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PreOpPage = require('../pages/PreOpPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('J. Pre-Op Checklist Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let preOpPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    preOpPage = new PreOpPage(driver);
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

  it('TC-PRE-01: Verify Smart Pre-Op Checklist Requirements & Surgery Readiness', async function () {
    const start = Date.now();
    try {
      await preOpPage.openPreOpChecklist(1);
      const isCheck = await preOpPage.verifyChecklist();
      expect(isCheck).to.be.true;
      recordTest('Pre-Op Checklist', 'TC-PRE-01: Verify Smart Pre-Op Checklist Requirements & Surgery Readiness', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Pre-Op Checklist', 'TC-PRE-01: Verify Smart Pre-Op Checklist Requirements & Surgery Readiness', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
