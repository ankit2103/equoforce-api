const config = require('../config');
const mail = require('../utils/mail');
const { addContactRow, addUnsubscribedEmail } = require('../utils/spreadsheet/spreadsheet');

async function sendEmail({ to, subject, text, html, from }) {
  const mailOptions = {
    from: from || `"${config.smtp.fromName}" <${config.smtp.user}>`,
    to,
    subject,
    text,
    html,
  };

  return mail.transporter.sendMail(mailOptions);
}

async function sendContactInquiry({ firstName, lastName, businessEmail, companyName, service, message = '' }) {
  const subject = mail.contactSubject({ firstName, lastName, companyName });
  const html = mail.contactHtml({ firstName, lastName, businessEmail, companyName, service, message });
  const text = mail.contactText({ firstName, lastName, businessEmail, companyName, service, message });

  await addContactRow({ firstName, lastName, businessEmail, companyName, service, message })
    .catch((err) => console.error('Spreadsheet log error:', err.message));

  return sendEmail({ to: config.contactRecipients, subject, text, html });
}

async function markUnsubscribed({ email }) {
  return addUnsubscribedEmail(email);
}

async function sendUnsubscribeNotification({ email }) {
  if (config.marketingRecipients.length === 0) {
    console.warn('No marketing recipients configured; skipping unsubscribe notification.');
    return null;
  }

  const subject = mail.unsubscribeNotificationSubject({ email });
  const html = mail.unsubscribeNotificationHtml({ email });
  const text = mail.unsubscribeNotificationText({ email });

  return sendEmail({ to: config.marketingRecipients, subject, text, html });
}

module.exports = { sendEmail, sendContactInquiry, markUnsubscribed, sendUnsubscribeNotification };