const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email via Google SMTP.
 * @param {object} options
 * @param {string|string[]} options.to       - Recipient email address(es)
 * @param {string}          options.subject  - Email subject
 * @param {string}          [options.text]   - Plain-text body
 * @param {string}          [options.html]   - HTML body
 * @param {string}          [options.from]   - Override sender (optional)
 * @returns {Promise<object>} nodemailer info object
 */
async function sendEmail({ to, subject, text, html, from }) {
  const mailOptions = {
    from: from || `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendEmail };
