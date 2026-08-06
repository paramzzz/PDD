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
  }

  async loginAsDoctor(doctorName = 'Dr. Sarah Wilson') {
    await this.setRole('DOCTOR');
  }

  async loginAsNurse(nurseName = 'Priya Nair') {
    await this.setRole('NURSE');
  }

  async setRole(roleName) {
    const roleUpper = roleName.toUpperCase();
    await this.driver.executeScript(`
      localStorage.setItem('cp_role', '${roleUpper}');
      if (typeof switchRole === 'function') switchRole('${roleUpper}');
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
