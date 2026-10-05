const { finalizeReport } = require('./testRunner');

(async () => {
  console.log('[ExcelReporter] Generating ClearPath_E2E_Test_Report.xlsx...');
  await finalizeReport();
})();
