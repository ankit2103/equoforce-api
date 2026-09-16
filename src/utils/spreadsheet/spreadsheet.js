const config = require('../../config');
const getSheetsClient = require('../../config/googleAuth');

const UNSUBSCRIBE_SHEET_NAME = 'Unsubscribed';
const CONTACT_HEADERS = ['First Name', 'Last Name', 'Email', 'Company', 'Service', 'Message', 'Submitted At'];
const UNSUBSCRIBE_HEADERS = ['Email', 'Unsubscribed At'];

let sheetNameCache = null;
let unsubscribeSheetEnsured = false;
const headerEnsuredSheets = new Set();

function timestamp() {
  return new Date().toLocaleString();
}

async function getFirstSheetName(sheets) {
  if (sheetNameCache) return sheetNameCache;
  const res = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheet.contactId, fields: 'sheets.properties.title' });
  sheetNameCache = res.data.sheets[0].properties.title;
  return sheetNameCache;
}

async function ensureUnsubscribeSheet(sheets) {
  if (unsubscribeSheetEnsured) return;

  const res = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheet.unsubscribeId, fields: 'sheets.properties.title' });
  const exists = res.data.sheets.some((s) => s.properties.title === UNSUBSCRIBE_SHEET_NAME);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.spreadsheet.unsubscribeId,
      resource: {
        requests: [{ addSheet: { properties: { title: UNSUBSCRIBE_SHEET_NAME } } }],
      },
    });
  }

  unsubscribeSheetEnsured = true;
}

async function ensureHeaderRow(sheets, spreadsheetId, sheetName, headers) {
  const cacheKey = `${spreadsheetId}:${sheetName}`;
  if (headerEnsuredSheets.has(cacheKey)) return;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
  });

  const firstRow = res.data.values && res.data.values[0];
  const hasHeader = firstRow && firstRow.some((cell) => cell && cell.trim() !== '');

  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [headers] },
    });
  }

  headerEnsuredSheets.add(cacheKey);
}

async function addUnsubscribedEmail(email) {
  const sheets = await getSheetsClient();
  await ensureUnsubscribeSheet(sheets);
  await ensureHeaderRow(sheets, config.spreadsheet.unsubscribeId, UNSUBSCRIBE_SHEET_NAME, UNSUBSCRIBE_HEADERS);

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheet.unsubscribeId,
    range: `${UNSUBSCRIBE_SHEET_NAME}!A:A`,
  });

  const rows = readRes.data.values || [];
  const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] && row[0].toLowerCase() === email.toLowerCase());

  if (rowIndex !== -1) {
    return sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheet.unsubscribeId,
      range: `${UNSUBSCRIBE_SHEET_NAME}!B${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[timestamp()]] },
    });
  }

  return sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheet.unsubscribeId,
    range: `${UNSUBSCRIBE_SHEET_NAME}!A:B`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[email, timestamp()]] },
  });
}

async function addContactRow({ firstName, lastName, businessEmail, companyName, service, message }) {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName(sheets);
  await ensureHeaderRow(sheets, config.spreadsheet.contactId, sheetName, CONTACT_HEADERS);
  const range = `${sheetName}!A:G`;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheet.contactId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[firstName, lastName, businessEmail, companyName, service, message, timestamp()]],
    },
  });

  return response;
}

async function findContactByEmail(email) {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName(sheets);

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheet.contactId,
    range: `${sheetName}!A:G`,
  });

  const rows = readRes.data.values || [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (row[2] && row[2].toLowerCase() === email.toLowerCase()) {
      return {
        firstName: row[0],
        lastName: row[1],
        email: row[2],
        companyName: row[3],
      };
    }
  }

  return null;
}

module.exports = { addContactRow, findContactByEmail, addUnsubscribedEmail };