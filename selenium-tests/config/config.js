require('dotenv').config();
const path = require('path');

const webPath = path.resolve(__dirname, '../../clear-path-web/index.html').replace(/\\/g, '/');

module.exports = {
  baseUrl: process.env.BASE_URL || `file:///${webPath}`,
  apiUrl: process.env.API_URL || 'http://127.0.0.1:8000',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true' || true,
  explicitWaitMs: 15000,
  pollIntervalMs: 500,
  
  credentials: {
    doctor: {
      role: 'DOCTOR',
      name: 'Dr. Sarah Wilson',
      title: 'Senior Cardiologist'
    },
    nurse: {
      role: 'NURSE',
      name: 'Priya Nair',
      title: 'Lead ICU Nurse'
    }
  },

  reportPaths: {
    excelReport: path.resolve(__dirname, '../reports/excel/Test_Report.xlsx'),
    excelSummary: path.resolve(__dirname, '../reports/excel/Test_Summary.xlsx'),
    htmlReport: path.resolve(__dirname, '../reports/html/mochawesome.html'),
    screenshotsDir: path.resolve(__dirname, '../reports/screenshots')
  }
};
