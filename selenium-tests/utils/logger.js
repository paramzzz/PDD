const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logFile = path.resolve(__dirname, '../reports/execution.log');
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  log(level, testName, message, durationMs = 0) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] [${testName}] ${message} ${durationMs ? `(${durationMs}ms)` : ''}\n`;
    console.log(logLine.trim());
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (e) {}
  }

  info(testName, message) {
    this.log('INFO', testName, message);
  }

  pass(testName, message, durationMs) {
    this.log('PASS', testName, message, durationMs);
  }

  fail(testName, error, durationMs) {
    const errText = error ? (error.stack || error.message || error) : 'Unknown Failure';
    this.log('FAIL', testName, `FAILED: ${errText}`, durationMs);
  }

  warn(testName, message) {
    this.log('WARN', testName, message);
  }
}

module.exports = new Logger();
