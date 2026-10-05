const fs = require('fs');
const path = require('path');
const config = require('../config/test.config');

const screenshotDir = config.paths.reportsScreenshots;
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function captureScreenshot(driver, testName, isFailure = false) {
  try {
    const image = await driver.takeScreenshot();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '_').slice(0, 15);
    const sanitizedName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const prefix = isFailure ? 'failed_' : 'milestone_';
    const filename = `${prefix}${sanitizedName}_${timestamp}.png`;
    const filePath = path.join(screenshotDir, filename);

    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  } catch (err) {
    console.error(`Failed to capture screenshot for ${testName}:`, err.message);
    return null;
  }
}

module.exports = { captureScreenshot };
