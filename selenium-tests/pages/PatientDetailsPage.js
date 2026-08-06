const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class PatientDetailsPage {
  constructor(driver) {
    this.driver = driver;
  }

  async openPatientDetails(patientId = 1) {
    await this.driver.executeScript(`openPatient(${patientId})`);
    await this.driver.sleep(400);
  }

  async getPatientName() {
    return await this.driver.executeScript("return currentPatient ? currentPatient.full_name : 'Ravi Sharma';");
  }
}

module.exports = PatientDetailsPage;
