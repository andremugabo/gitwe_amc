const nodemailer = require('nodemailer');
const prisma = require('./prisma');

const sendEmail = async ({ to, subject, text, html }) => {
  let enableEmail = true;
  let smtpHost = 'smtp.gmail.com';
  let smtpPort = 465;

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['enableEmail', 'smtpHost', 'smtpPort'] }
      }
    });

    settings.forEach(s => {
      if (s.key === 'enableEmail') enableEmail = s.value === 'true';
      if (s.key === 'smtpHost') smtpHost = s.value;
      if (s.key === 'smtpPort') smtpPort = parseInt(s.value, 10) || 465;
    });
  } catch (err) {
    console.error('Failed to load SMTP settings from database, using defaults:', err.message);
  }

  if (!enableEmail) {
    console.log(`[EMAIL SENDING DISABLED]: Skipped sending email to ${to} (${subject})`);
    return { skipped: true };
  }

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

  // Create dynamic SMTP transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // True for port 465, false for 587
    auth: {
      user: emailUser,
      pass: emailPass
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
