const express = require('express');
const cors = require('cors');
const config = require('./config');
const { emailRoutes } = require('./routes');

const app = express();

app.use(cors(config.cors));
app.use(express.json());

app.use('/api/email', emailRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

module.exports = app;