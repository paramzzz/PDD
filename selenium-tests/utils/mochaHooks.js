const { finalizeReport } = require('./testRunner');

after(async function () {
  console.log('\n========================================');
  console.log('Generating Excel & Execution Reports...');
  console.log('========================================');
  await finalizeReport();
});
