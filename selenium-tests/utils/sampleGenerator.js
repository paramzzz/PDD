const fs = require('fs');
const path = require('path');

function ensureSampleFiles() {
  const dir = path.resolve(__dirname, '../sample_docs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const jpgPath = path.join(dir, 'sample_prescription.jpg');
  if (!fs.existsSync(jpgPath)) {
    // 1x1 dummy JPG pixel
    const dummyJpg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
    fs.writeFileSync(jpgPath, dummyJpg);
  }

  const pdfPath = path.join(dir, 'sample_mri.pdf');
  if (!fs.existsSync(pdfPath)) {
    const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n173\n%%EOF', 'utf-8');
    fs.writeFileSync(pdfPath, dummyPdf);
  }

  return { jpgPath, pdfPath };
}

module.exports = { ensureSampleFiles };
