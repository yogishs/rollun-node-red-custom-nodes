const { getGSheet } = require('./sdk');
const { parseGSheetUrl, columnToLetter } = require('./utils');
const { getTypedFieldValue } = require('../node-red-contrib-common-utils/1-global-utils')

async function updateRow(sheet, rowIndex, rowData) {
  const headers = sheet.headerValues;
  const newRowAddress = `A${rowIndex}:${columnToLetter(headers.length)}${rowIndex}`;
  await sheet.loadCells(newRowAddress);

  // generate new row
  headers.forEach((header, idx) => {
    if (rowData[header]) {
      sheet.getCell(rowIndex - 1, idx).value = rowData[header]
    }
  });

  await sheet.saveUpdatedCells();
}

module.exports = function (RED) {
  function GSheetUpdateRow(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.config = RED.nodes.getNode(config.config);

    node.on('input', async function (msg) {

      const makeError = (text) => {
        msg.payload = { error: text };
        node.send([msg, null])
      };

      if (!node.config) return makeError(`node.config is required!`);
      if (!config.sheetURL) return makeError(`sheetURL is required!`);
      if (!config.rowIndex) return makeError(`rowIndex is required!`);
      if (!config.rowData) return makeError(`rowData is required`);

      const sheetURL = getTypedFieldValue(msg, config.sheetURL);
      const rowIndex = +getTypedFieldValue(msg, config.rowIndex);
      const rowData = getTypedFieldValue(msg, config.rowData);

      if (!(typeof rowData === 'object' && rowData !== null && Object.keys(rowData).length > 0)) {
        return makeError(`rowData must be non empty object`);
      }

      if (isNaN(rowIndex) || rowIndex < 2) {
        return makeError(`rowIndex must be a number, min allowed value - 2`);
      }

      try {
        const { sheetId, tableId } = parseGSheetUrl(sheetURL);
        const sheet = await getGSheet(sheetId, tableId, node.config.creds);

        await sheet.loadHeaderRow()
        const headers = sheet.headerValues;

        const notFoundKeys = Object.keys(rowData).filter(key => !headers.includes(key));
        if (notFoundKeys.length > 0) {
          throw new Error(`fields [${notFoundKeys}], where not found in row with index ${rowIndex}. Available field values: ${headers}`);
        }

        await updateRow(sheet, rowIndex, rowData);

        node.send([null, msg]);
      } catch (err) {
        msg.payload = { error: err.stack };
        node.send([msg, null]);
      }
    });
  }

  RED.nodes.registerType("gsheets-update-row", GSheetUpdateRow);
}
