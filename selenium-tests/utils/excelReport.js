const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/test.config');

const excelDir = config.paths.reportsExcel;
const htmlDir = config.paths.reportsHtml;

if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

async function generateExcelReport(resultsData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ClearPath Selenium E2E QA Framework';
  workbook.lastModifiedBy = 'ClearPath Selenium E2E QA Framework';
  workbook.created = new Date();

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B365D' } // Dark Navy
  };

  const headerFont = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const passFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4EDDA' } // Light Green
  };

  const failFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8D7DA' } // Light Red
  };

  const border = {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
  };

  const {
    testSuiteName = 'CLEAR PATH Web Application — Selenium E2E Test Suite',
    startTime = new Date().toISOString(),
    endTime = new Date().toISOString(),
    durationSec = 0,
    tests = [],
    logs = []
  } = resultsData;

  const passedTests = tests.filter(t => t.status === 'PASSED');
  const failedTests = tests.filter(t => t.status === 'FAILED');
  const totalTests = tests.length;
  const passRatePct = totalTests > 0 ? ((passedTests.length / totalTests) * 100).toFixed(2) : 0;

  // ---------------------------------------------------------
  // SHEET 1: SUMMARY
  // ---------------------------------------------------------
  const wsSummary = workbook.addWorksheet('Summary', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsSummary.columns = [
    { header: 'Test Suite', key: 'suite', width: 50 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 15 },
    { header: 'Failed', key: 'failed', width: 15 },
    { header: 'Pass Rate %', key: 'passRate', width: 18 },
    { header: 'Duration (sec)', key: 'duration', width: 18 },
    { header: 'Start Time', key: 'startTime', width: 25 },
    { header: 'End Time', key: 'endTime', width: 25 }
  ];

  wsSummary.autoFilter = 'A1:H1';

  wsSummary.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  wsSummary.addRow({
    suite: testSuiteName,
    total: totalTests,
    passed: passedTests.length,
    failed: failedTests.length,
    passRate: `${passRatePct}%`,
    duration: durationSec.toFixed(2),
    startTime: startTime,
    endTime: endTime
  });

  wsSummary.getRow(2).eachCell((cell) => {
    cell.border = border;
    cell.alignment = { vertical: 'middle' };
  });

  // ---------------------------------------------------------
  // SHEET 2: PASSED TESTS
  // ---------------------------------------------------------
  const wsPassed = workbook.addWorksheet('Passed Tests', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsPassed.columns = [
    { header: 'No.', key: 'num', width: 10 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Time (sec)', key: 'time', width: 15 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  wsPassed.autoFilter = 'A1:E1';

  wsPassed.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  passedTests.forEach((t, idx) => {
    const row = wsPassed.addRow({
      num: idx + 1,
      category: t.category || 'General',
      name: t.name,
      time: t.durationSec ? t.durationSec.toFixed(2) : '0.00',
      status: 'PASSED'
    });
    row.eachCell((cell, colNum) => {
      cell.border = border;
      cell.alignment = { vertical: 'middle' };
      if (colNum === 5) {
        cell.fill = passFill;
        cell.font = { bold: true, color: { argb: 'FF155724' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ---------------------------------------------------------
  // SHEET 3: FAILED TESTS
  // ---------------------------------------------------------
  const wsFailed = workbook.addWorksheet('Failed Tests', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsFailed.columns = [
    { header: 'No.', key: 'num', width: 10 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Error', key: 'error', width: 55 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 25 }
  ];

  wsFailed.autoFilter = 'A1:F1';

  wsFailed.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  failedTests.forEach((t, idx) => {
    const row = wsFailed.addRow({
      num: idx + 1,
      category: t.category || 'General',
      name: t.name,
      error: t.error || 'Assertion Error or Timeout',
      status: 'FAILED',
      timestamp: t.timestamp || new Date().toISOString()
    });
    row.eachCell((cell, colNum) => {
      cell.border = border;
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (colNum === 5) {
        cell.fill = failFill;
        cell.font = { bold: true, color: { argb: 'FF721C24' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ---------------------------------------------------------
  // SHEET 4: EXECUTION LOG
  // ---------------------------------------------------------
  const wsLog = workbook.addWorksheet('Execution Log', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsLog.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Level', key: 'level', width: 12 },
    { header: 'Message', key: 'message', width: 75 }
  ];

  wsLog.autoFilter = 'A1:C1';

  wsLog.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  logs.forEach((logItem) => {
    const row = wsLog.addRow({
      timestamp: logItem.timestamp || new Date().toISOString(),
      level: logItem.level || 'INFO',
      message: logItem.message || ''
    });
    row.eachCell((cell, colNum) => {
      cell.border = border;
      cell.alignment = { vertical: 'middle', wrapText: colNum === 3 };
      if (colNum === 2) {
        cell.font = { bold: true, color: { argb: logItem.level === 'ERROR' ? 'FF721C24' : 'FF004085' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ---------------------------------------------------------
  // SHEET 5: TEST DETAILS
  // ---------------------------------------------------------
  const wsDetails = workbook.addWorksheet('Test Details', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  wsDetails.columns = [
    { header: 'No.', key: 'num', width: 10 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Error Details', key: 'errorDetails', width: 65 }
  ];

  wsDetails.autoFilter = 'A1:E1';

  wsDetails.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  tests.forEach((t, idx) => {
    const row = wsDetails.addRow({
      num: idx + 1,
      category: t.category || 'General',
      name: t.name,
      status: t.status,
      errorDetails: t.status === 'PASSED' ? 'None — test passed successfully.' : (t.error || 'Test failed.')
    });
    row.eachCell((cell, colNum) => {
      cell.border = border;
      cell.alignment = { vertical: 'middle', wrapText: colNum === 5 };
      if (colNum === 4) {
        cell.fill = t.status === 'PASSED' ? passFill : failFill;
        cell.font = { bold: true, color: { argb: t.status === 'PASSED' ? 'FF155724' : 'FF721C24' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ---------------------------------------------------------
  // SAVE WORKBOOK FILES
  // ---------------------------------------------------------
  const primaryReportPath = path.join(excelDir, 'ClearPath_Selenium_E2E_Test_Report.xlsx');
  const legacyReportPath = path.join(excelDir, 'ClearPath_E2E_Test_Report.xlsx');
  
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const timestampStr = `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
  
  const timestampedReportPath = path.join(excelDir, `ClearPath_Selenium_E2E_Test_Report_${timestampStr}.xlsx`);

  await workbook.xlsx.writeFile(primaryReportPath);
  await workbook.xlsx.writeFile(legacyReportPath);
  await workbook.xlsx.writeFile(timestampedReportPath);

  console.log(`[OK] Primary Excel Report generated at: ${primaryReportPath}`);
  console.log(`[OK] Legacy Excel Report generated at: ${legacyReportPath}`);
  console.log(`[OK] Timestamped Excel generated at: ${timestampedReportPath}`);

  // Sync Mochawesome HTML to ClearPath_Selenium_E2E_Test_Report.html if available
  try {
    const mochawesomeHtml = path.join(htmlDir, 'mochawesome.html');
    const customHtml = path.join(htmlDir, 'ClearPath_Selenium_E2E_Test_Report.html');
    if (fs.existsSync(mochawesomeHtml)) {
      fs.copyFileSync(mochawesomeHtml, customHtml);
      console.log(`[OK] HTML Report synced to: ${customHtml}`);
    }
  } catch (htmlErr) {
    console.warn(`[WARN] HTML report copy warning: ${htmlErr.message}`);
  }

  return primaryReportPath;
}

module.exports = { generateExcelReport };

