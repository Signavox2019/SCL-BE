const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

const generateCertificate = async ({ userName, courseTitle, completionDate, certificateId }) => {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  const certPath = path.join(__dirname, `../certificates/${certificateId}.pdf`);

  await fs.ensureDir(path.join(__dirname, '../certificates'));

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(certPath);
    doc.pipe(stream);

    // Background and Title
    doc
      .fontSize(30)
      .text('Certificate of Completion', { align: 'center', underline: true });

    // Name
    doc.moveDown(2)
      .fontSize(20)
      .text(`This is to certify that`, { align: 'center' })
      .fontSize(28)
      .text(userName, { align: 'center', bold: true });

    // Course Title
    doc.moveDown(1)
      .fontSize(20)
      .text(`has successfully completed the course`, { align: 'center' })
      .fontSize(24)
      .text(courseTitle, { align: 'center' });

    // Completion Date
    doc.moveDown(2)
      .fontSize(16)
      .text(`Completed on: ${completionDate}`, { align: 'center' });

    // Certificate ID
    doc.moveDown(1)
      .fontSize(10)
      .text(`Certificate ID: ${certificateId}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(certPath));
    stream.on('error', reject);
  });
};

module.exports = generateCertificate;
