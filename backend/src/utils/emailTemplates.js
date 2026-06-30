const wrapTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gitwe AMC Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 14px;
      opacity: 0.85;
    }
    .content {
      padding: 40px 32px;
      color: #1f2937;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 15px;
    }
    .code-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
      font-size: 32px;
      font-weight: 850;
      letter-spacing: 6px;
      color: #1e3a8a;
      font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
    }
    .details-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .details-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .details-label {
      width: 120px;
      font-weight: bold;
      color: #4b5563;
      flex-shrink: 0;
    }
    .details-val {
      color: #1f2937;
    }
    .footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 24px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .footer p {
      margin: 0 0 8px 0;
    }
    .footer p:last-child {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Gitwe Ministerial Centre. All rights reserved.</p>
        <p>This is an automated administrative notification. Please do not reply directly.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const getVerificationTemplate = (name, code) => wrapTemplate(`
  <div class="header">
    <h1>Verify Your Account</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for registering on the Gitwe AMC Administration Platform. To activate your account and access your dashboard, please enter the following verification code:</p>
    <div class="code-box">${code}</div>
    <p>This verification code is valid for immediate activation. If you did not sign up for this account, please ignore this email.</p>
  </div>
`);

const getPasswordResetTemplate = (name, code) => wrapTemplate(`
  <div class="header">
    <h1>Password Reset Request</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your Gitwe AMC account. Please enter the verification code below to complete the reset process:</p>
    <div class="code-box">${code}</div>
    <p>If you did not request a password reset, you can safely ignore this message — your credentials remain secure.</p>
  </div>
`);

const getCourseScheduledTemplate = (name, courseTitle, startDate, location, duration) => wrapTemplate(`
  <div class="header">
    <h1>New Training Program Scheduled</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${name}</strong>,</p>
    <p>A new elder training program has been scheduled and is now open for enrollment. Please review the program details below:</p>
    
    <div class="details-card">
      <div class="details-row">
        <div class="details-label">Course:</div>
        <div class="details-val"><strong>${courseTitle}</strong></div>
      </div>
      <div class="details-row">
        <div class="details-label">Starts:</div>
        <div class="details-val">${startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Duration:</div>
        <div class="details-val">${duration || 'N/A'}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Location:</div>
        <div class="details-val">${location || 'Gitwe Campus'}</div>
      </div>
    </div>

    <p>Please log in to your dashboard to recommend eligible elders and view training details.</p>
    <div class="button-container">
      <a href="http://localhost:5173/login" class="button">Log In to Dashboard</a>
    </div>
  </div>
`);

const getElderEnrolledTemplate = (name, courseTitle, startDate, location) => wrapTemplate(`
  <div class="header">
    <h1>Enrolled in Training Course</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${name}</strong>,</p>
    <p>Congratulations! You have been successfully registered for the following training course:</p>
    
    <div class="details-card">
      <div class="details-row">
        <div class="details-label">Course:</div>
        <div class="details-val"><strong>${courseTitle}</strong></div>
      </div>
      <div class="details-row">
        <div class="details-label">Start Date:</div>
        <div class="details-val">${startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Location:</div>
        <div class="details-val">${location || 'Gitwe Campus'}</div>
      </div>
    </div>

    <p>All reading files, lecture dates, and course materials are now accessible under the **E-Learning Library** section on your dashboard.</p>
    <div class="button-container">
      <a href="http://localhost:5173/login" class="button">Access E-Learning Library</a>
    </div>
  </div>
`);

const getRecommendationTemplate = (recipientName, pastorName, elderName, courseName, notes) => wrapTemplate(`
  <div class="header">
    <h1>Elder Training Recommendation</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${recipientName}</strong>,</p>
    <p>Pastor <strong>${pastorName}</strong> has submitted a recommendation for an elder to undergo training:</p>
    
    <div class="details-card">
      <div class="details-row">
        <div class="details-label">Recommended:</div>
        <div class="details-val"><strong>Elder ${elderName}</strong></div>
      </div>
      <div class="details-row">
        <div class="details-label">Program:</div>
        <div class="details-val">${courseName}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Notes:</div>
        <div class="details-val">"${notes || 'None'}"</div>
      </div>
    </div>

    <p>Please log in to review recommendations and finalize course enrollment registration.</p>
    <div class="button-container">
      <a href="http://localhost:5173/login" class="button">Review Recommendations</a>
    </div>
  </div>
`);

const getCertificateIssuedTemplate = (name, courseTitle, verifyCode) => wrapTemplate(`
  <div class="header">
    <h1>Training Certificate Awarded</h1>
    <p>Gitwe Ministerial Centre Administration</p>
  </div>
  <div class="content">
    <p>Hello <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your digital certificate for completing <strong>${courseTitle}</strong> has been issued!</p>
    
    <div class="details-card" style="text-align: center;">
      <p style="margin: 0; font-size: 13px; color: #4b5563; font-weight: bold;">VERIFICATION CODE</p>
      <div style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin-top: 4px; font-family: monospace;">${verifyCode}</div>
    </div>

    <p>You can view, print, or download your PDF certificate with its verification QR code from your dashboard.</p>
    <div class="button-container">
      <a href="http://localhost:5173/login" class="button">View Certificate</a>
    </div>
  </div>
`);

module.exports = {
  getVerificationTemplate,
  getPasswordResetTemplate,
  getCourseScheduledTemplate,
  getElderEnrolledTemplate,
  getRecommendationTemplate,
  getCertificateIssuedTemplate
};
