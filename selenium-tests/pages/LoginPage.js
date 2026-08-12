const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.roleSelector = By.id('role-select');
    this.doctorRoleBtn = By.id('role-btn-doctor');
    this.nurseRoleBtn = By.id('role-btn-nurse');
    this.userNameDisplay = By.id('nav-user-name');
    this.navRoleBadge = By.id('nav-role-badge');
  }

  async open() {
    await this.driver.get(config.baseUrl);
    await this.driver.wait(until.elementLocated(By.tagName('body')), config.explicitWaitMs);
    await this.driver.executeScript(`
      show('pg-main');
      if (typeof navTo === 'function') navTo('home');
    `);
  }

  async loginAsDoctor(doctorName = 'Dr. Sarah Wilson') {
    await this.setRole('DOCTOR', doctorName);
  }

  async loginAsNurse(nurseName = 'Priya Nair') {
    await this.setRole('NURSE', nurseName);
  }

  async setRole(roleName, userName = 'Dr. Sarah Wilson') {
    const roleUpper = roleName.toUpperCase();
    await this.driver.executeScript(`
      localStorage.setItem('cp_role', '${roleUpper}');
      localStorage.setItem('cp_doctor', '${userName}');
      doctorName = '${userName}';
      show('pg-main');
      if (typeof navTo === 'function') navTo('home');
    `);
  }

  async getActiveRole() {
    return await this.driver.executeScript("return localStorage.getItem('cp_role') || 'DOCTOR';");
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }
}

module.exports = LoginPage;
