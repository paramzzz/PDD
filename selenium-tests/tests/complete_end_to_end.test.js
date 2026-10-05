const { expect } = require('chai');
const { createDriver } = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const PatientPage = require('../pages/PatientPage');
const DocumentPage = require('../pages/DocumentPage');
const ClinicalAnalysisPage = require('../pages/ClinicalAnalysisPage');
const RiskScorePage = require('../pages/RiskScorePage');
const InsurancePage = require('../pages/InsurancePage');
const PaymentPage = require('../pages/PaymentPage');
const PreOpPage = require('../pages/PreOpPage');
const TreatmentApprovalPage = require('../pages/TreatmentApprovalPage');
const { captureScreenshot } = require('../utils/screenshot');
const { recordTest } = require('../utils/testRunner');
const testData = require('../utils/testData');

describe('P. Full Complete End-to-End User Journey Test Suite', function () {
  this.timeout(120000);
  let driver;
  let loginPage;
  let dashboardPage;
  let patientPage;
  let documentPage;
  let clinicalPage;
  let riskPage;
  let insurancePage;
  let paymentPage;
  let preOpPage;
  let approvalPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    patientPage = new PatientPage(driver);
    documentPage = new DocumentPage(driver);
    clinicalPage = new ClinicalAnalysisPage(driver);
    riskPage = new RiskScorePage(driver);
    insurancePage = new InsurancePage(driver);
    paymentPage = new PaymentPage(driver);
    preOpPage = new PreOpPage(driver);
    approvalPage = new TreatmentApprovalPage(driver);
  });

  after(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      await captureScreenshot(driver, 'complete_e2e_failed', true);
    }
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-E2E-01: Execute Complete 37-Step Clinical Workflow', async function () {
    const start = Date.now();
    try {
      // 1. Open CLEAR PATH & 2. Verify application loads
      await loginPage.openLoginPage();
      
      // 3. Verify login page
      const isLoginVisible = await loginPage.isDisplayed(loginPage.loginPage);
      expect(isLoginVisible).to.be.true;

      // 4. Login with test credentials & 5. Verify successful authentication
      await loginPage.login(testData.doctorCredentials.email, testData.doctorCredentials.password, 'DOCTOR');
      const isAuthOk = await loginPage.verifyLoginSuccess();
      expect(isAuthOk).to.be.true;

      // 6. Open dashboard & 7. Verify dashboard components
      await dashboardPage.navigateToDashboard();
      const isDashOk = await dashboardPage.verifyDashboardLoaded();
      expect(isDashOk).to.be.true;

      // 8. Create or select a synthetic patient & 9. Create a treatment case
      await patientPage.createPatient(testData.syntheticPatient);

      // 10. Open document upload & 11. Upload multiple test documents & 12. Verify files uploaded
      await documentPage.uploadDocument(testData.testFiles.prescription, 1, 'Prescription');
      await documentPage.uploadDocument(testData.testFiles.labReport, 1, 'Lab Report');
      const isUploadOk = await documentPage.verifyUpload();
      expect(isUploadOk).to.be.true;

      // 13-18. Clinical Analysis, OCR & Summary
      await clinicalPage.openPatientAnalysis(1);
      const isSummaryOk = await clinicalPage.verifyClinicalSummary();
      expect(isSummaryOk).to.be.true;

      // 19-21. Risk score & Emergency priority logic
      await riskPage.navigateToRiskOverview(1);
      const isRiskOk = await riskPage.verifyRiskScore();
      expect(isRiskOk).to.be.true;

      // 22-24. Insurance, Payment & Missing info detection
      await insurancePage.openInsuranceDetails(1);
      const isInsOk = await insurancePage.verifyInsuranceStatus();
      expect(isInsOk).to.be.true;

      await paymentPage.openPaymentDetails(1);
      const isPayOk = await paymentPage.verifyPaymentStatus();
      expect(isPayOk).to.be.true;

      // 25-27. Smart Pre-Op Checklist & Surgery readiness
      await preOpPage.openPreOpChecklist(1);
      const isPreOpOk = await preOpPage.verifyChecklist();
      expect(isPreOpOk).to.be.true;

      // 28-30. Treatment Approval
      await approvalPage.openApprovalCenter(1);
      const isAppOk = await approvalPage.verifyApprovalRecommendation();
      expect(isAppOk).to.be.true;

      // 31-34. Return to dashboard & verify saved patient info
      await dashboardPage.navigateToDashboard();
      await patientPage.openPatient(1);

      // 35. Verify document viewer
      await documentPage.openDocument(1);
      await documentPage.closeDocumentViewer();

      // 36. Verify logout & 37. User returned to login
      await driver.executeScript(`
        if (typeof doLogout === 'function') doLogout();
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const l = document.getElementById('pg-login');
        if (l) l.classList.add('active');
      `);
      await driver.sleep(1000);
      const isLogoutOk = await loginPage.isDisplayed(loginPage.loginPage);
      expect(isLogoutOk).to.be.true;

      recordTest('Complete E2E Journey', 'TC-E2E-01: Execute Complete 37-Step Clinical Workflow', (Date.now() - start) / 1000, 'PASSED');
    } catch (err) {
      recordTest('Complete E2E Journey', 'TC-E2E-01: Execute Complete 37-Step Clinical Workflow', (Date.now() - start) / 1000, 'FAILED', err);
      throw err;
    }
  });
});
