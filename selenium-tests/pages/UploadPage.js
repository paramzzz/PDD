const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class UploadPage {
  constructor(driver) {
    this.driver = driver;
    this.modal = By.id('mdms-upload-modal');
    this.fileInput = By.id('mdms-file-inp');
    this.patientSelect = By.id('mdms-up-patient');
    this.docTypeSelect = By.id('mdms-up-type');
    this.submitBtn = By.id('mdms-btn-submit-upload');
    this.nameDisplay = By.id('mdms-file-name-display');
  }

  async openUploadModal() {
    await this.driver.executeScript("openMDMSUploadModal()");
    await this.driver.sleep(300);
  }

  async uploadFile(filePath, patientId = 1, docType = 'Prescription') {
    await this.driver.executeScript(`
      navTo('scan');
      openMDMSUploadModal();
      document.getElementById('mdms-file-inp').style.display = 'block';
      if (document.getElementById('mdms-up-patient')) document.getElementById('mdms-up-patient').value = '${patientId}';
      if (document.getElementById('mdms-up-type')) document.getElementById('mdms-up-type').value = '${docType}';
    `);
    await this.driver.sleep(300);

    const fileEl = await this.driver.findElement(this.fileInput);
    await fileEl.sendKeys(filePath);
    await this.driver.sleep(400);

    await this.driver.executeScript("submitMDMSUpload()");
    await this.driver.sleep(2500); // Wait for multi-step upload progress & auto viewer modal open
  }

  async closeUploadModal() {
    await this.driver.executeScript("closeMDMSUploadModal()");
    await this.driver.sleep(200);
  }
}

module.exports = UploadPage;
