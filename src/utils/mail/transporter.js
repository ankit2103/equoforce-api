const nodemailer = require('nodemailer');
const config = require('../../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

module.exports = transporter;