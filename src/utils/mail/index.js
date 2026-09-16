const transporter = require('./transporter');
const templates = require('./templates');

module.exports = { transporter, ...templates };