require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.SMTP_FROM_NAME || 'Equoforce',
  },

  contactRecipients: process.env.CONTACT_RECIPIENTS
    ? process.env.CONTACT_RECIPIENTS.split(',').map((e) => e.trim())
    : [],

  marketingRecipients: process.env.MARKETING_RECIPIENTS
    ? process.env.MARKETING_RECIPIENTS.split(',').map((e) => e.trim())
    : [],


  spreadsheet: {
    contactId: process.env.CONTACT_SPREADSHEET_ID,
    unsubscribeId: process.env.UNSUBSCRIBE_SPREADSHEET_ID,
  },
};

module.exports = config;