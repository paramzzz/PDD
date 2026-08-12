const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class ViewerPage {
  constructor(driver) {
    this.driver = driver;
    this.modal = By.id('mdms-viewer-modal');
    this.previewWrapper = By.id('mdms-preview-wrapper');
    this.closeBtn = By.xpath("//*[@id='mdms-viewer-modal']//button[contains(text(),'Close') or contains(text(),'✕')]");
    this.tabContent = By.id('mdms-viewer-tab-content');
  }

  async openViewerForDocument(docId) {
    await this.driver.executeScript(`
      navTo('scan');
      openMDMSViewerModal(${docId});
    `);
    await this.waitForContentToLoad();
  }

  async waitForContentToLoad() {
    await this.driver.wait(async () => {
      try {
        const modalVisible = await this.isModalVisible();
        if (!modalVisible) return false;
        const text = await this.driver.executeScript(`
          const el = document.getElementById('mdms-viewer-tab-content');
          return el ? el.innerText : '';
        `);
        return text.includes('AI BUNDLE') || text.includes('AUTOMATED TREATMENT APPROVAL') || text.includes('AI RISK SCORING') || text.includes('Primary Diagnosis');
      } catch (e) {
        return false;
      }
    }, config.explicitWaitMs, 'AI Clinical Intelligence payload failed to render');
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
    try {
      const btn = await this.driver.wait(until.elementLocated(this.closeBtn), 3000);
      await btn.click();
    } catch (e) {
      await this.driver.executeScript("closeMDMSViewerModal()");
    }
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
    await this.waitForContentToLoad();
    return await this.driver.executeScript(`
      const el = document.getElementById('mdms-viewer-tab-content');
      return el ? el.innerText : '';
    `);
  }
}

module.exports = ViewerPage;
