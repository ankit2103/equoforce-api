const { validationResult } = require('express-validator');
const config = require('../config');
const { sendEmail, sendContactInquiry, markUnsubscribed, sendUnsubscribeNotification } = require('../services/emailService');
const { successRes, errorRes } = require('../utils/common');

async function sendEmailController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorRes(res, 400, 'Validation failed.', { errors: errors.array() });
  }

  const { to, subject, text, html } = req.body;

  if (!text && !html) {
    return errorRes(res, 400, 'At least one of "text" or "html" body is required.');
  }

  try {
    const info = await sendEmail({ to, subject, text, html });
    return successRes(res, 200, { message: 'Email sent successfully.', messageId: info.messageId });
  } catch (err) {
    console.error('Email send error:', err.message);
    return errorRes(res, 500, 'Failed to send email.', { error: err.message });
  }
}

async function sendContactController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorRes(res, 400, 'Validation failed.', { errors: errors.array() });
  }

  const { firstName, lastName, businessEmail, companyName, service, message } = req.body;

  if (config.contactRecipients.length === 0) {
    return errorRes(res, 500, 'No contact recipients configured.');
  }

  try {
    const info = await sendContactInquiry({
      firstName,
      lastName,
      businessEmail,
      companyName,
      service,
      message,
    });
    return successRes(res, 200, { message: 'Inquiry submitted successfully.', messageId: info.messageId });
  } catch (err) {
    console.error('Contact form email error:', err.message);
    return errorRes(res, 500, 'Failed to send inquiry.', { error: err.message });
  }
}

async function unsubscribeController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorRes(res, 400, 'Validation failed.', { errors: errors.array() });
  }

  const { email } = req.body;

  try {
    await markUnsubscribed({ email });
    sendUnsubscribeNotification({ email })
      .catch((err) => console.error('Unsubscribe notification error:', err.message));
    return successRes(res, 200, { message: 'Unsubscribed successfully.' });
  } catch (err) {
    console.error('Unsubscribe error:', err.message);
    return errorRes(res, 500, 'Failed to unsubscribe.', { error: err.message });
  }
} 

module.exports = { sendEmailController, sendContactController, unsubscribeController};