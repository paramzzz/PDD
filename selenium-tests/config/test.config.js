const path = require('path');

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://127.0.0.1:8000',
  headless: process.env.HEADLESS === 'true' || false,
  implicitWaitMs: 5000,
  explicitWaitMs: 15000,
  browser: process.env.BROWSER || 'chrome',
  credentials: {
    doctor: {
      email: process.env.DOCTOR_EMAIL || 'doctor@clearpath.ai',
      password: process.env.DOCTOR_PASSWORD || 'doctor123',
      name: 'Dr. Sarah Wilson',
      role: 'DOCTOR'
    },
    nurse: {
      email: process.env.NURSE_EMAIL || 'priya@clearpath.ai',
      password: process.env.NURSE_PASSWORD || 'nurse123',
      name: 'Nurse Priya Nair',
      role: 'NURSE'
    }
  },
  paths: {
    reportsExcel: path.join(__dirname, '../reports/excel'),
    reportsHtml: path.join(__dirname, '../reports/html'),
    reportsScreenshots: path.join(__dirname, '../reports/screenshots'),
    reportsLogs: path.join(__dirname, '../reports/logs'),
    testData: path.join(__dirname, '../test-data')
  }
};
