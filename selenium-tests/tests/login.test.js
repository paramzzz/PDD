const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('🔑 Module 1: Login & Role Management', function () {
  this.timeout(60000);
  let driver;
  let loginPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    await loginPage.open();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-LOG-01: Verify Application Launch & Title', async function () {
    const startTime = Date.now();
    try {
      const title = await loginPage.getPageTitle();
      expect(title.toUpperCase()).to.include('CLEAR');
      
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-01_Launch', 'pass');
      
      excelReporter.addResult({
        testId: 'TC-LOG-01',
        module: 'Login',
        testName: 'Application Launch',
        expected: 'Page loads with CLEAR PATH title',
        actual: `Loaded successfully with title: ${title}`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-LOG-01', 'Application Launch', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-01_Launch', 'fail');
      excelReporter.addResult({
        testId: 'TC-LOG-01',
        module: 'Login',
        testName: 'Application Launch',
        expected: 'Page loads cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-LOG-01', e, duration);
      throw e;
    }
  });

  it('TC-LOG-02: Doctor Login Role Selection', async function () {
    const startTime = Date.now();
    try {
      await loginPage.loginAsDoctor('Dr. Sarah Wilson');
      const role = await loginPage.getActiveRole();
      expect(role).to.equal('DOCTOR');

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-02_DoctorLogin', 'pass');
      
      excelReporter.addResult({
        testId: 'TC-LOG-02',
        module: 'Login',
        testName: 'Doctor Login',
        expected: 'Role set to DOCTOR',
        actual: `Active role confirmed: ${role}`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-LOG-02', 'Doctor Login Successful', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-02_DoctorLogin', 'fail');
      excelReporter.addResult({
        testId: 'TC-LOG-02',
        module: 'Login',
        testName: 'Doctor Login',
        expected: 'Role set to DOCTOR',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-LOG-02', e, duration);
      throw e;
    }
  });

  it('TC-LOG-03: Nurse Login Role Selection', async function () {
    const startTime = Date.now();
    try {
      await loginPage.loginAsNurse('Priya Nair');
      const role = await loginPage.getActiveRole();
      expect(role).to.equal('NURSE');

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-03_NurseLogin', 'pass');
      
      excelReporter.addResult({
        testId: 'TC-LOG-03',
        module: 'Login',
        testName: 'Nurse Login',
        expected: 'Role set to NURSE',
        actual: `Active role confirmed: ${role}`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-LOG-03', 'Nurse Login Successful', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-LOG-03_NurseLogin', 'fail');
      excelReporter.addResult({
        testId: 'TC-LOG-03',
        module: 'Login',
        testName: 'Nurse Login',
        expected: 'Role set to NURSE',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-LOG-03', e, duration);
      throw e;
    }
  });
});
