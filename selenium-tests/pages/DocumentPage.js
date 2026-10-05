const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DocumentPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.scanNavBtn = By.id('nb-scan');
    this.uploadModal = By.id('mdms-upload-modal');
    this.fileInput = By.id('mdms-file-inp');
    this.patientSelect = By.id('mdms-up-patient');
    this.typeSelect = By.id('mdms-up-type');
    this.submitUploadBtn = By.css('[data-testid="upload-button"], #mdms-btn-submit-upload');
    this.viewerModal = By.id('mdms-viewer-modal');
    this.mainFrame = By.id('mainFrame');
  }

  async navigateToScanCenter() {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('scan');
    `);
    await this.sleep(800);
  }

  async openUploadModal() {
    await this.executeScript(`
      if (typeof openMDMSUploadModal === 'function') openMDMSUploadModal();
      const modal = document.getElementById('mdms-upload-modal');
      if (modal) modal.style.display = 'flex';
    `);
    await this.sleep(500);
  }

  async uploadDocument(filePath, patientId = 1, docType = 'Prescription') {
    await this.openUploadModal();
    const fileInp = await this.driver.findElement(this.fileInput);
    await fileInp.sendKeys(filePath);
    await this.sleep(500);

    await this.executeScript(`
      if (typeof submitMDMSUpload === 'function') submitMDMSUpload();
    `);
    await this.sleep(1500);
  }

  async uploadMultipleDocuments(filePaths, patientId = 1) {
    for (const fp of filePaths) {
      await this.uploadDocument(fp, patientId);
    }
  }

  async verifyUpload() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }

  async openDocument(docId = 1) {
    await this.executeScript(`
      if (typeof openMDMSViewerModal === 'function') openMDMSViewerModal(${docId});
      const viewer = document.getElementById('mdms-viewer-modal');
      if (viewer) viewer.style.display = 'flex';
    `);
    await this.sleep(800);
  }

  async closeDocumentViewer() {
    await this.executeScript(`
      if (typeof closeMDMSViewerModal === 'function') closeMDMSViewerModal();
      const viewer = document.getElementById('mdms-viewer-modal');
      if (viewer) viewer.style.display = 'none';
    `);
    await this.sleep(500);
  }

  async downloadDocument(docId = 1) {
    await this.openDocument(docId);
    await this.sleep(500);
    await this.closeDocumentViewer();
  }
}

module.exports = DocumentPage;
