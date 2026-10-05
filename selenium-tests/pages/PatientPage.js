const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PatientPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.patientsNavBtn = By.id('nb-patients');
    this.nameInput = By.id('np-name');
    this.ageInput = By.id('np-age');
    this.genderSelect = By.id('np-gender');
    this.complaintInput = By.id('np-complaint');
    this.bpInput = By.id('np-bp');
    this.hrInput = By.id('np-hr');
    this.tempInput = By.id('np-temp');
    this.spo2Input = By.id('np-spo2');
    this.insuranceInput = By.id('np-ins');
    this.policyInput = By.id('np-policy');
    this.searchInput = By.id('patient-search-input');
    this.mainFrame = By.id('mainFrame');
  }

  async navigateToPatients() {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patients');
    `);
    await this.sleep(800);
  }

  async openNewPatientForm() {
    await this.executeScript(`
      const f = document.getElementById('mainFrame');
      if (typeof navTo === 'function') navTo('new-patient');
      else if (typeof renderNewPatient === 'function') renderNewPatient(f);
    `);
    await this.sleep(800);
  }

  async createPatient(data) {
    await this.openNewPatientForm();
    
    await this.executeScript(`
      const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      setVal('np-name', '${data.name || 'Selenium Test Patient'}');
      setVal('np-age', '${data.age || '45'}');
      setVal('np-gender', '${data.gender || 'Male'}');
      setVal('np-complaint', '${data.complaint || 'Severe chest pain'}');
      setVal('np-bp', '${data.bp || '160/100'}');
      setVal('np-hr', '${data.hr || '110'}');
      setVal('np-temp', '${data.temp || '98.6'}');
      setVal('np-spo2', '${data.spo2 || '92%'}');
      setVal('np-ins', '${data.insurance || 'Star Health Insurance'}');
      setVal('np-policy', '${data.policy || 'POL-99887766'}');
      if (typeof submitNewPatient === 'function') submitNewPatient();
    `);
    await this.sleep(2000);
  }

  async searchPatient(query) {
    await this.navigateToPatients();
    await this.executeScript(`
      const inp = document.getElementById('patient-search-input');
      if (inp) {
        inp.value = '${query}';
        if (typeof renderQueue === 'function') renderQueue(document.getElementById('mainFrame'));
      }
    `);
    await this.sleep(500);
  }

  async openPatient(patientId = 1) {
    await this.executeScript(`
      if (typeof navTo === 'function') navTo('patient-detail', ${patientId});
    `);
    await this.sleep(1000);
  }

  async verifyPatientDetails() {
    const text = await this.getText(this.mainFrame);
    return text.length > 20;
  }
}

module.exports = PatientPage;
