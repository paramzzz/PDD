const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class ExcelReporter {
  constructor() {
    this.results = [];
    this.metrics = {
      apiResponseTimes: [],
      uploadTimes: [],
      viewerLoadTimes: []
    };
  }

  addResult({ testId, module, testName, expected, actual, status, duration, screenshot, remarks = '' }) {
    this.results.push({
      testId,
      module,
      testName,
      expected,
      actual,
      status: status ? status.toUpperCase() : 'PASS',
      executionTime: new Date().toLocaleString(),
      duration: duration || 0,
      screenshot: screenshot || 'N/A',
      remarks
    });
  }

  recordMetric(type, valueMs) {
    if (this.metrics[type]) {
      this.metrics[type].push(valueMs);
    }
  }

  async generateReports() {
    await this.generateTestReport();
    await this.generateTestSummary();
  }

  async generateTestReport() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test Execution Details');

    sheet.columns = [
      { header: 'Test ID', key: 'testId', width: 12 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Expected Result', key: 'expected', width: 35 },
      { header: 'Actual Result', key: 'actual', width: 35 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Execution Time', key: 'executionTime', width: 22 },
      { header: 'Duration (ms)', key: 'duration', width: 15 },
      { header: 'Screenshot Path', key: 'screenshot', width: 45 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    this.results.forEach(res => {
      const row = sheet.addRow(res);
      const statusCell = row.getCell('status');
      const st = (res.status || 'PASS').toUpperCase();

      if (st === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D4EDDA' } };
        statusCell.font = { color: { argb: '155724' }, bold: true };
      } else if (st === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
        statusCell.font = { color: { argb: '721C24' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
        statusCell.font = { color: { argb: '856404' }, bold: true };
      }
    });

    const reportPath = config.reportPaths.excelReport;
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await workbook.xlsx.writeFile(reportPath);
    console.log(`📊 Excel Detailed Report saved at: ${reportPath}`);
  }

  async generateTestSummary() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Executive Test Summary');

    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED' || r.status === 'WARNING').length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';

    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const avgResponseTime = avg(this.metrics.apiResponseTimes) + ' ms';
    const avgUploadTime = avg(this.metrics.uploadTimes) + ' ms';
    const avgViewerLoadTime = avg(this.metrics.viewerLoadTimes) + ' ms';

    sheet.columns = [
      { header: 'Metric Name', key: 'metric', width: 32 },
      { header: 'Value', key: 'value', width: 30 },
      { header: 'Category', key: 'category', width: 25 }
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    const summaryRows = [
      { metric: 'Total Test Cases Executed', value: total, category: 'Suite Metrics' },
      { metric: 'Passed Test Cases', value: passed, category: 'Suite Metrics' },
      { metric: 'Failed Test Cases', value: failed, category: 'Suite Metrics' },
      { metric: 'Skipped / Warning Cases', value: skipped, category: 'Suite Metrics' },
      { metric: 'Overall Success Rate', value: successRate, category: 'Quality Assessment' },
      { metric: 'Total Suite Execution Time', value: new Date().toLocaleString(), category: 'Performance' },
      { metric: 'Average API Response Time', value: avgResponseTime, category: 'Telemetry' },
      { metric: 'Average Multi-Doc Upload Time', value: avgUploadTime, category: 'Telemetry' },
      { metric: 'Average Viewer Load Time', value: avgViewerLoadTime, category: 'Telemetry' }
    ];

    summaryRows.forEach(r => sheet.addRow(r));

    const summaryPath = config.reportPaths.excelSummary;
    const dir = path.dirname(summaryPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await workbook.xlsx.writeFile(summaryPath);
    console.log(`📈 Excel Executive Summary saved at: ${summaryPath}`);
  }
}

const reporterInstance = new ExcelReporter();
module.exports = reporterInstance;
