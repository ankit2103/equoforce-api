const { body } = require('express-validator');

const emailSendValidation = [
  body('to')
    .notEmpty().withMessage('Recipient "to" is required.')
    .isEmail().withMessage('Invalid recipient email address.'),
  body('subject')
    .notEmpty().withMessage('Email subject is required.')
    .isLength({ max: 255 }).withMessage('Subject must be at most 255 characters.'),
  body('text').optional().isString(),
  body('html').optional().isString(),
];

const contactValidation = [
  body('firstName').notEmpty().withMessage('First name is required.').trim().escape(),
  body('lastName').notEmpty().withMessage('Last name is required.').trim().escape(),
  body('businessEmail').notEmpty().isEmail().withMessage('Valid business email is required.').normalizeEmail(),
  body('companyName').notEmpty().withMessage('Company name is required.').trim().escape(),
  body('service').optional().trim().escape(),
  body('message').optional().trim().escape(),
];

const unsubscribeValidation = [
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Valid email is required.')
    .normalizeEmail(),
];

module.exports = { emailSendValidation, contactValidation, unsubscribeValidation };