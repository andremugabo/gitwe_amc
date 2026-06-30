const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Fallback to simulation if credentials are not configured yet
  if (!emailUser || !emailPass) {
    console.warn('\n⚠️  [EMAIL CONFIG WARNING]: EMAIL_USER and EMAIL_PASS environment variables are not configured in your .env file.');
    console.log(`[SIMULATED EMAIL LOG]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    console.log(`-------------------------------------\n`);
    return { simulated: true };
  }

  // Create Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass // Note: Should be a 16-character App Password, not main login password
    }
  });

  const mailOptions = {
    from: `"Gitwe AMC Platform" <${emailUser}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT]: Message successfully sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR]: Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
