const path = require('path');

module.exports = {
  doctorCredentials: {
    email: 'doctor@clearpath.ai',
    password: 'doctor123',
    role: 'DOCTOR'
  },
  nurseCredentials: {
    email: 'priya@clearpath.ai',
    password: 'nurse123',
    role: 'NURSE'
  },
  invalidCredentials: {
    email: 'invalid@clearpath.ai',
    password: 'wrongpassword'
  },
  syntheticPatient: {
    name: 'Selenium Test Patient',
    age: '45',
    gender: 'Male',
    complaint: 'Severe chest pain with shortness of breath',
    bp: '160/100',
    hr: '110',
    temp: '98.6',
    spo2: '92%',
    insurance: 'Star Health Insurance',
    policy: 'POL-99887766'
  },
  testFiles: {
    prescription: path.join(__dirname, '../test-data/sample_prescription.pdf'),
    labReport: path.join(__dirname, '../test-data/sample_lab_report.pdf'),
    scanReport: path.join(__dirname, '../test-data/sample_scan_report.pdf'),
    insurance: path.join(__dirname, '../test-data/sample_insurance.pdf'),
    paymentReceipt: path.join(__dirname, '../test-data/sample_payment_receipt.pdf')
  }
};
