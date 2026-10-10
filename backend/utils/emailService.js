const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } catch (err) {
      console.warn('[Email Service] Failed to initialize real transporter, falling back to mock mode.');
      transporter = null;
    }
  }
};

initTransporter();

const sendEmailNotification = async ({ to, subject, html, text }) => {
  if (!transporter) {
    // In dev or without SMTP credentials configured, log cleanly
    console.log(`[Email Dispatch Simulation] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"QueueLess Gov Services" <notifications@queueless.gov.in>',
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Dispatch Error]', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendEmailNotification,
};
