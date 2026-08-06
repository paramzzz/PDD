const excelReporter = require('./excelReporter');

module.exports = {
  addTestResult: (data) => excelReporter.addResult(data),
  recordMetric: (type, val) => excelReporter.recordMetric(type, val),
  generateAllReports: async () => await excelReporter.generateReports()
};
