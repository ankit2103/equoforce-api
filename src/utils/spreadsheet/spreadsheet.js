const config = require('../../config');
const getSheetsClient = require('../../config/googleAuth');

let sheetNameCache = null;

async function getFirstSheetName(sheets) {
  if (sheetNameCache) return sheetNameCache;
  const res = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheet.id, fields: 'sheets.properties.title' });
  sheetNameCache = res.data.sheets[0].properties.title;
  return sheetNameCache;
}

async function addContactRow({ firstName, lastName, businessEmail, companyName, service, message, isSubscribed = true }) {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName(sheets);
  const range = `${sheetName}!A:G`;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheet.id,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[firstName, lastName, businessEmail, companyName, service, message, isSubscribed]],
    },
  });

  return response;
}

async function setContactUnsubscribed(email) {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName(sheets);

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheet.id,
    range: `${sheetName}!A:G`,
  });

  const rows = readRes.data.values || [];
  const matches = [];
  let contact = null;

  rows.forEach((row, index) => {
    if (index === 0) return;
    if (row[2] && row[2].toLowerCase() === email.toLowerCase()) {
      matches.push(index + 1);
      if (!contact) {
        contact = {
          firstName: row[0],
          lastName: row[1],
          email: row[2],
          companyName: row[3],
        };
      }
    }
  });

  if (matches.length === 0) {
    return { updated: 0, contact: null };
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: config.spreadsheet.id,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: matches.map((rowNumber) => ({
        range: `${sheetName}!G${rowNumber}`,
        values: [['FALSE']],
      })),
    },
  });

  return { updated: matches.length, contact };
}

module.exports = { addContactRow, setContactUnsubscribed };