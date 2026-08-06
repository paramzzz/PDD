const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class PatientPage {
  constructor(driver) {
    this.driver = driver;
    this.patientCards = By.className('pt-card');
  }

  async openPatients() {
    await this.driver.executeScript("navTo('patients')");
    await this.driver.sleep(400);
  }

  async searchPatient(query) {
    await this.driver.executeScript(`
      if (typeof filterPtCategory === 'function') filterPtCategory('all');
    `);
    await this.driver.sleep(300);
  }

  async selectPatientById(patientId) {
    await this.driver.executeScript(`openPatient(${patientId})`);
    await this.driver.sleep(400);
  }

  async getPatientCardsCount() {
    const cards = await this.driver.findElements(this.patientCards);
    return cards.length;
  }
}

module.exports = PatientPage;
