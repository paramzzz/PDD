const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class ScanCenterPage {
  constructor(driver) {
    this.driver = driver;
    this.tabRepository = By.id('mdms-tab-repository');
    this.tabPending = By.id('mdms-tab-pending');
    this.tabSearch = By.id('mdms-tab-search');
    this.tabTimeline = By.id('mdms-tab-timeline');
    this.uploadBtn = By.id('mdms-btn-upload');
    this.patientSelect = By.id('mdms-patient-select');
    this.searchInput = By.id('mdms-search-input');
    this.docCards = By.className('mdms-doc-card');
  }

  async openScanCenter() {
    await this.driver.executeScript("navTo('scan')");
    await this.driver.sleep(400);
  }

  async switchTab(tabName) {
    await this.driver.executeScript(`switchMDMSTab('${tabName}')`);
    await this.driver.sleep(400);
  }

  async selectPatient(patientId) {
    await this.driver.executeScript(`
      mdmsSelectedPatientId = ${patientId};
      const sel = document.getElementById('mdms-patient-select');
      if (sel) { sel.value = '${patientId}'; sel.dispatchEvent(new Event('change')); }
      loadMDMSRepository(${patientId});
    `);
    await this.driver.wait(until.elementsLocated(this.docCards), config.explicitWaitMs, 'Document cards failed to load for patient');
  }

  async getDocumentCardsCount() {
    try {
      const cards = await this.driver.wait(until.elementsLocated(this.docCards), config.explicitWaitMs);
      return cards.length;
    } catch (e) {
      const cards = await this.driver.findElements(this.docCards);
      return cards.length;
    }
  }

  async searchDocuments(query) {
    await this.switchTab('search');
    await this.driver.executeScript(`
      const inp = document.getElementById('mdms-search-input');
      if (inp) { inp.value = '${query}'; }
      if (typeof searchMDMSDocuments === 'function') {
        searchMDMSDocuments('${query}');
      } else {
        loadMDMSSearch();
      }
    `);
    await this.driver.sleep(600);
  }
}

module.exports = ScanCenterPage;
