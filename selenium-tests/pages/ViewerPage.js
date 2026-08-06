const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class ViewerPage {
  constructor(driver) {
    this.driver = driver;
    this.modal = By.id('mdms-viewer-modal');
    this.previewWrapper = By.id('mdms-preview-wrapper');
    this.closeBtn = By.xpath("//button[contains(text(),'Close') or contains(text(),'✕')]");
    this.tabContent = By.id('mdms-viewer-tab-content');
  }

  async openViewerForDocument(docId) {
    await this.driver.executeScript(`
      navTo('scan');
      openMDMSViewerModal(${docId});
    `);
    await this.driver.sleep(1200);
  }

  async isModalVisible() {
    return await this.driver.executeScript(`
      const modal = document.getElementById('mdms-viewer-modal');
      return modal && modal.style.display !== 'none';
    `);
  }

  async closeViewer() {
    await this.driver.executeScript("closeMDMSViewerModal()");
    await this.driver.sleep(300);
  }

  async clickCloseButton() {
    const btn = await this.driver.wait(until.elementLocated(this.closeBtn), config.explicitWaitMs);
    await btn.click();
    await this.driver.sleep(300);
  }

  async zoomIn() {
    await this.driver.executeScript("adjustMDMSZoom(0.2)");
    await this.driver.sleep(200);
  }

  async zoomOut() {
    await this.driver.executeScript("adjustMDMSZoom(-0.2)");
    await this.driver.sleep(200);
  }

  async rotate() {
    await this.driver.executeScript("rotateMDMSImage()");
    await this.driver.sleep(200);
  }

  async reset() {
    await this.driver.executeScript("resetMDMSView()");
    await this.driver.sleep(200);
  }

  async getAiClinicalSummaryText() {
    const el = await this.driver.wait(until.elementLocated(this.tabContent), config.explicitWaitMs);
    return await el.getText();
  }
}

module.exports = ViewerPage;
