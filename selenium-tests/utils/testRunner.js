const { generateExcelReport } = require('./excelReport');
const logger = require('./logger');

const testRegistry = {
  startTime: new Date().toISOString(),
  tests: [],
  logs: []
};

function recordTest(category, name, durationSec, status, error = null) {
  const timestamp = new Date().toISOString();
  testRegistry.tests.push({
    category,
    name,
    durationSec,
    status,
    error: error ? (error.message || String(error)) : null,
    timestamp
  });

  const logMsg = `[${category}] ${name} → ${status} (${durationSec.toFixed(2)}s)`;
  testRegistry.logs.push({
    timestamp,
    level: status === 'PASSED' ? 'INFO' : 'ERROR',
    message: error ? `${logMsg} | Error: ${error.message}` : logMsg
  });

  if (status === 'PASSED') {
    logger.info(category, `${name} passed in ${durationSec.toFixed(2)}s`);
  } else {
    logger.error(category, `${name} failed`, error);
  }
}

async function finalizeReport() {
  testRegistry.endTime = new Date().toISOString();
  const startMs = new Date(testRegistry.startTime).getTime();
  const endMs = new Date(testRegistry.endTime).getTime();
  testRegistry.durationSec = (endMs - startMs) / 1000;

  try {
    await generateExcelReport(testRegistry);
  } catch (err) {
    console.error('Failed to generate Excel report:', err);
  }
}

module.exports = {
  recordTest,
  finalizeReport,
  testRegistry
};
