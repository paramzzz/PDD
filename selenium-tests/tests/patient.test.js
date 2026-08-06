const { expect } = require('chai');
const { createDriver } = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const PatientPage = require('../pages/PatientPage');
const logger = require('../utils/logger');
const { captureScreenshot } = require('../utils/screenshot');
const excelReporter = require('../utils/excelReporter');

describe('👨‍⚕️ Module 4: Patient Directory & Search', function () {
  this.timeout(60000);
  let driver;
  let loginPage;
  let patientPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    patientPage = new PatientPage(driver);
    await loginPage.open();
    await patientPage.openPatients();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC-PAT-01: Load Patient Directory & Count Cards', async function () {
    const startTime = Date.now();
    try {
      const count = await patientPage.getPatientCardsCount();
      expect(count).to.be.above(0);

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PAT-01_Cards', 'pass');

      excelReporter.addResult({
        testId: 'TC-PAT-01',
        module: 'Patient Directory',
        testName: 'Load Patient Directory Cards',
        expected: 'Multiple patient cards render',
        actual: `Loaded ${count} patient cards`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-PAT-01', `Directory loaded ${count} cards`, duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PAT-01_Cards', 'fail');
      excelReporter.addResult({
        testId: 'TC-PAT-01',
        module: 'Patient Directory',
        testName: 'Load Patient Directory Cards',
        expected: 'Cards render cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-PAT-01', e, duration);
      throw e;
    }
  });

  it('TC-PAT-02: Search Patient by Name Query', async function () {
    const startTime = Date.now();
    try {
      await patientPage.searchPatient('Ravi');
      const count = await patientPage.getPatientCardsCount();
      expect(count).to.be.above(0);

      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PAT-02_Search', 'pass');

      excelReporter.addResult({
        testId: 'TC-PAT-02',
        module: 'Patient Directory',
        testName: 'Search Patient by Query',
        expected: 'Filtered patient results render',
        actual: `Found ${count} search result cards`,
        status: 'PASS',
        duration,
        screenshot
      });
      logger.pass('TC-PAT-02', 'Patient search filtered cleanly', duration);
    } catch (e) {
      const duration = Date.now() - startTime;
      const screenshot = await captureScreenshot(driver, 'TC-PAT-02_Search', 'fail');
      excelReporter.addResult({
        testId: 'TC-PAT-02',
        module: 'Patient Directory',
        testName: 'Search Patient by Query',
        expected: 'Search results render cleanly',
        actual: e.message,
        status: 'FAIL',
        duration,
        screenshot
      });
      logger.fail('TC-PAT-02', e, duration);
      throw e;
    }
  });
});
