async function waitForCondition(driver, conditionFn, timeoutMs = 15000, pollMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await conditionFn();
      if (res) return res;
    } catch (e) {}
    await driver.sleep(pollMs);
  }
  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
}

module.exports = { waitForCondition };
