const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function captureScreenshot(driver, testName, stage = 'after') {
  if (!driver) return null;
  try {
    const cleanName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${cleanName}_${stage}_${timestamp}.png`;
    const targetDir = config.reportPaths.screenshotsDir;
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filepath = path.join(targetDir, filename);
    const imageBase64 = await driver.takeScreenshot();
    fs.writeFileSync(filepath, imageBase64, 'base64');
    return filepath;
  } catch (e) {
    console.error(`Failed to capture screenshot for ${testName}: ${e.message}`);
    return null;
  }
}

module.exports = { captureScreenshot };
