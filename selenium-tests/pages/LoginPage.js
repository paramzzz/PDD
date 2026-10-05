const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/test.config');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.loginPage = By.id('pg-login');
    this.mainPage = By.id('pg-main');
    this.emailInput = By.id('li-email');
    this.passwordInput = By.id('li-pass');
    this.loginBtn = By.css('[data-testid="login-button"]');
    this.errorMsg = By.id('li-err');
    this.doctorRoleTab = By.id('role-tab-doctor');
    this.nurseRoleTab = By.id('role-tab-nurse');
  }

  async openLoginPage() {
    await this.open(config.baseUrl);
    await this.executeScript(`
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const loginPg = document.getElementById('pg-login');
      if (loginPg) loginPg.classList.add('active');
    `);
  }

  async selectRole(role = 'DOCTOR') {
    if (role.toUpperCase() === 'NURSE') {
      if (await this.isDisplayed(this.nurseRoleTab)) {
        await this.click(this.nurseRoleTab);
      }
    } else {
      if (await this.isDisplayed(this.doctorRoleTab)) {
        await this.click(this.doctorRoleTab);
      }
    }
  }

  async enterEmail(email) {
    await this.type(this.emailInput, email);
  }

  async enterPassword(password) {
    await this.type(this.passwordInput, password);
  }

  async clickLogin() {
    await this.click(this.loginBtn);
  }

  async login(email = config.credentials.doctor.email, password = config.credentials.doctor.password, role = 'DOCTOR') {
    await this.openLoginPage();
    await this.selectRole(role);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
    await this.sleep(1000);
  }

  async verifyLoginSuccess() {
    return await this.isDisplayed(this.mainPage);
  }

  async verifyLoginError() {
    return await this.isDisplayed(this.errorMsg);
  }

  async getErrorMessage() {
    if (await this.verifyLoginError()) {
      return await this.getText(this.errorMsg);
    }
    return '';
  }
}

module.exports = LoginPage;
