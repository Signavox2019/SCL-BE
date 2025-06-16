const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendCertificateMail = async (to, name, certPath) => {
  const mailOptions = {
    from: `"Signavox SCL" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎓 Your Course Certificate from Signavox`,
    text: `Hi ${name},\n\nCongratulations on completing your course! Find your certificate attached.`,
    attachments: [
      {
        filename: 'Certificate.pdf',
        path: certPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendCertificateMail;
