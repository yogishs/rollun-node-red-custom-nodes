const { GoogleSpreadsheet } = require('google-spreadsheet');

async function getGSheet(sheetId, tableId, creds, { loadCells } = {}) {
  const doc = new GoogleSpreadsheet(sheetId);

  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo();
  const sheet = doc.sheetsById[tableId];
  if (!sheet) {
    throw new Error(`Google sheet with id ${tableId} not found!`);
  }
  if (loadCells) {
    await sheet.loadCells(loadCells);
  }
  return sheet;
}

module.exports = {
  getGSheet,
}
