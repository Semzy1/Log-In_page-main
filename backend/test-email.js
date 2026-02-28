const nodemailer = require('nodemailer');

async function sendTest() {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: '"ShopEase Test" <test@example.com>',
      to: 'recipient@example.com',
      subject: 'Nodemailer v7 smoke test',
      text: 'This is a test message (plaintext)',
      html: '<p>This is a <strong>test</strong> message (HTML)</p>'
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    process.exit(0);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(2);
  }
}

sendTest();