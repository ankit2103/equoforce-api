const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

/**
 * POST /api/email/send
 * Body: { to, subject, text?, html? }
 */
router.post(
  '/send',
  [
    body('to')
      .notEmpty().withMessage('Recipient "to" is required.')
      .isEmail().withMessage('Invalid recipient email address.'),
    body('subject')
      .notEmpty().withMessage('Email subject is required.')
      .isLength({ max: 255 }).withMessage('Subject must be at most 255 characters.'),
    body('text').optional().isString(),
    body('html').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { to, subject, text, html } = req.body;

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        message: 'At least one of "text" or "html" body is required.',
      });
    }

    try {
      const info = await sendEmail({ to, subject, text, html });
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully.',
        messageId: info.messageId,
      });
    } catch (err) {
      console.error('Email send error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email.',
        error: err.message,
      });
    }
  }
);

/**
 * POST /api/email/contact
 * Handles the "Send us a Message" contact form.
 * Always delivers to the fixed recipients defined in CONTACT_RECIPIENTS env var.
 * Body: { firstName, lastName, businessEmail, companyName, service?, message }
 */
router.post(
  '/contact',
  [
    body('firstName').notEmpty().withMessage('First name is required.').trim().escape(),
    body('lastName').notEmpty().withMessage('Last name is required.').trim().escape(),
    body('businessEmail').notEmpty().isEmail().withMessage('Valid business email is required.').normalizeEmail(),
    body('companyName').notEmpty().withMessage('Company name is required.').trim().escape(),
    body('service').optional().trim().escape(),
    body('message').notEmpty().withMessage('Message is required.').trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, businessEmail, companyName, service, message } = req.body;

    const recipients = process.env.CONTACT_RECIPIENTS
      ? process.env.CONTACT_RECIPIENTS.split(',').map((e) => e.trim())
      : [];

    if (recipients.length === 0) {
      return res.status(500).json({ success: false, message: 'No contact recipients configured.' });
    }

    const subject = `New Inquiry from ${firstName} ${lastName} — ${companyName}`;

    const html = `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><td><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td><strong>Business Email:</strong></td><td>${businessEmail}</td></tr>
        <tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>
        <tr><td><strong>Service:</strong></td><td>${service || 'Not specified'}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message}</td></tr>
      </table>
    `;

    const text = `New Inquiry\n\nName: ${firstName} ${lastName}\nBusiness Email: ${businessEmail}\nCompany: ${companyName}\nService: ${service || 'Not specified'}\nMessage: ${message}`;

    try {
      const info = await sendEmail({ to: recipients, subject, text, html });
      return res.status(200).json({
        success: true,
        message: 'Inquiry submitted successfully.',
        messageId: info.messageId,
      });
    } catch (err) {
      console.error('Contact form email error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send inquiry.',
        error: err.message,
      });
    }
  }
);

module.exports = router;
