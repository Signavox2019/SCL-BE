const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.generateCertificate = async ({ userName, courseTitle, outputPath }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc
      .fontSize(26)
      .text('Certificate of Completion', { align: 'center', underline: true });

    doc.moveDown();
    doc.fontSize(20).text(`This is to certify that`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).text(`${userName}`, { align: 'center', bold: true });
    doc.moveDown();
    doc.fontSize(20).text(`has successfully completed the`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).text(`${courseTitle}`, { align: 'center', bold: true });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};
