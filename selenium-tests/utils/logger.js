const fs = require('fs');
const path = require('path');
const config = require('../config/test.config');

const logDir = config.paths.reportsLogs;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'ClearPath_E2E_Execution.log');

function log(level, category, message, error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}${error ? ` | Error: ${error.message || error}` : ''}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

module.exports = {
  info: (category, message) => log('INFO', category, message),
  error: (category, message, err) => log('ERROR', category, message, err),
  warn: (category, message) => log('WARN', category, message),
  getLogFilePath: () => logFile
};
