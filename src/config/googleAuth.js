const path = require('path');
const { google } = require('googleapis');

const credentialsPath = path.join(__dirname, '../../', 'credentials.json');

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

module.exports = getSheetsClient;