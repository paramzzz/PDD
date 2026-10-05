const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DocumentPage = require('../pages/DocumentPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');

describe('M. Document Viewer Test Suite', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let documentPage;

  beforeEach(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    documentPage = new DocumentPage(driver);
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

  it('TC-VIEW-01: Open & Close Document Viewer Modal', async function () {
    const start = Date.now();
    try {
      await documentPage.openDocument(1);
      const isViewerOpen = await documentPage.isDisplayed(documentPage.viewerModal);
      await documentPage.closeDocumentViewer();
      expect(isViewerOpen).to.be.true;
      recordTest('Document Viewer', 'TC-VIEW-01: Open & Close Document Viewer Modal', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Document Viewer', 'TC-VIEW-01: Open & Close Document Viewer Modal', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
