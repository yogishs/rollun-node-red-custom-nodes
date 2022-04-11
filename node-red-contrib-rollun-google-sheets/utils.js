const { URL } = require('url');

function parseGSheetUrl(url) {
  const parsedUrl = new URL(url);

  const sheetIdMatch = parsedUrl.pathname.match(/spreadsheets\/d\/(?<sheetId>.+)\//i);
  const tableIdMatch = parsedUrl.hash.match(/gid=(?<tableId>[0-9]+)/i);
  if (!sheetIdMatch) {
    throw new Error(`Could not get sheetId from url.`);
  }
  if (!tableIdMatch) {
    throw new Error(`Could not get tableId from url.`);
  }

  const { sheetId } = sheetIdMatch.groups;
  const { tableId } = tableIdMatch.groups;
  return { sheetId, tableId };
}

function columnToLetter(column) {
  let temp;
  let letter = '';
  let col = column;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter) {
  let column = 0;
  const { length } = letter;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * 26 ** (length - i - 1);
  }
  return column;
}

function formatGSheetToArray(sheet) {
  const cells = sheet._cells;
  if (cells.length === 0) return [];
  const header = cells[0].map((cell, idx) => {
    if (!cell._rawData.userEnteredValue) {
      throw new Error(`Header row at column #${idx + 1} does not have value!`);
    }
    return cell._rawData.userEnteredValue.stringValue
  });
  return cells
    .slice(1)
    .map(row =>
      row.reduce((acc, { _rawData }, idx) => {
        const { userEnteredValue = {}, effectiveValue = {}, formattedValue = '' } = _rawData;
        return {
          ...acc,
          [header[idx]]: {
            userEnteredValueString: userEnteredValue.stringValue,
            userEnteredValueNumber: userEnteredValue.numberValue,
            effectiveValueString: effectiveValue.stringValue,
            effectiveValueNumber: effectiveValue.numberValue,
            formattedValue: formattedValue
          }
        };
      }, {})
    );
}

/**
 * @param rows
 * @param headers
 */
async function rowsToArray(rows, headers) {
  const cells = rows.map(row => ({ data: row._rawData, rowNumber: row._rowNumber}));

  return cells.reduce((acc, { data, rowNumber }) => {
    const formattedRow = {};
    headers.forEach((header, idx) => {
      if (data[idx]) {
        formattedRow[header] = data[idx];
      }
    })

    return acc.concat({ row: formattedRow, rowNumber });
  }, []);
}

module.exports = {
  rowsToArray,
  parseGSheetUrl,
  formatGSheetToArray,
  columnToLetter,
  letterToColumn,
}
