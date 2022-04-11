const joi = require('joi');
const { formatGSheetToArray } = require('./utils');
const { rowsToArray } = require('./utils');
const { getGSheet } = require('./sdk');
const { parseGSheetUrl, columnToLetter } = require('./utils');
const {
  resolvePayload,
  validateObjectSchema,
  getTypedFieldValue
} = require('../node-red-contrib-common-utils/1-global-utils');
const _ = require('lodash');

const actionsPayloadSchema = {
  getRows: joi.object({
    from: joi.number().min(2).required(),
    to: joi.number().min(2).required(),
    returnRaw: joi.boolean().default(false),
  }),
  getCells: joi.object({
    cells: joi.string().regex(/^[0-9a-z]+:[0-9a-z]+$/i).required(),
    returnRaw: joi.boolean().default(false),
  }),
  updateRow: joi.object({
    rowIndex: joi.number().min(2).required(),
    rowData: joi.object(),
  }),
  updateRows: joi.object({
    startRowIndex: joi.number().min(2).required(),
    rowsData: joi.array().required().items(joi.object()),
  }),
  appendRow: joi.object({
    rowData: joi.object(),
  }),
};

class ValidationError extends Error {
  constructor(msgs) {
    super('Validation error');
    this.messages = msgs;
  }
}

function validateHeadersInData(headers, data) {
  let errors = [];

  for (let idx = 0; idx < data.length; idx += 1) {
    const item = data[idx];
    const notFoundKeys = Object.keys(item).filter(key => !headers.includes(key));
    if (notFoundKeys.length > 0) {
      errors.push(`at row [${idx}] fields [${notFoundKeys}] are not valid. Available field names: ${headers}`);
    }
  }

  return { errors: errors.length ? errors : null };
}

const handlers = {
  getRows: async function (creds, { sheetId, tableId }, { from, to, returnRaw }) {
    const sheet = await getGSheet(
      sheetId,
      tableId,
      creds,
    );
    await sheet.loadHeaderRow()

    const rows = await sheet.getRows({ offset: from - 2, limit: to - from + 1 });

    return returnRaw ? rows : rowsToArray(rows, sheet.headerValues);
  },
  getCells: async function (creds, { sheetId, tableId }, { cells, returnRaw }) {
    const sheet = await getGSheet(
      sheetId,
      tableId,
      creds,
      { loadCells: cells }
    );
    await sheet.loadHeaderRow()

    return returnRaw ? sheet : formatGSheetToArray(sheet);
  },
  updateRow: async function (creds, { sheetId, tableId }, { rowIndex, rowData }) {
    const sheet = await getGSheet(sheetId, tableId, creds);

    await sheet.loadHeaderRow()
    const headers = sheet.headerValues;

    const { errors } = validateHeadersInData(headers, [rowData]);

    if (errors) {
      throw new ValidationError(errors);
    }

    const newRowAddress = `A${rowIndex}:${columnToLetter(headers.length)}${rowIndex}`;
    await sheet.loadCells(newRowAddress);

    // generate new row
    headers.forEach((header, idx) => {
      // do not override cell, if value is not in row
      if (!(header in rowData)) {
        return;
      }
      sheet.getCell(rowIndex - 1, idx).value = rowData[header];
    });

    await sheet.saveUpdatedCells();
  },
  updateRows: async function (creds, { sheetId, tableId }, { startRowIndex, rowsData }) {
    const sheet = await getGSheet(sheetId, tableId, creds);

    await sheet.loadHeaderRow()
    const headers = sheet.headerValues;

    const { errors } = validateHeadersInData(headers, rowsData);

    if (errors) {
      throw new ValidationError(errors);
    }

    const CHUNK_SIZE = 500;
    const chunks = _.chunk(rowsData, CHUNK_SIZE);

    for (let chunkNum = 0; chunkNum < chunks.length; chunkNum += 1) {
      const chunk = chunks[chunkNum];
      const addressFrom = `A${startRowIndex + chunk.length * chunkNum}`;
      const addressTo = `${columnToLetter(headers.length)}${startRowIndex + chunk.length * (chunkNum + 1)}`;
      await sheet.loadCells(`${addressFrom}:${addressTo}`);

      chunk.forEach((row, itemNum) => {
        // generate new row
        headers.forEach((header, colNum) => {
          // do not override cell, if value is not in row
          if (!(header in row)) {
            return;
          }
          const value = row[header];
          const rowIndex = startRowIndex + (chunkNum * CHUNK_SIZE) + itemNum - 1;
          sheet.getCell(rowIndex, colNum).value = value;
        });
      });
      await sheet.saveUpdatedCells();
    }
  },
  appendRow: async function (creds, { sheetId, tableId }, { rowData }) {
    const sheet = await getGSheet(sheetId, tableId, creds);

    await sheet.loadHeaderRow()
    const headers = sheet.headerValues;

    validateHeadersInData(headers, rowData);


    const { _rowNumber, _sheet, _rawData, ...row } = await sheet.addRow(rowData);
    return { rowNumber: _rowNumber, row };
  }
}

module.exports = function (RED) {
  function GSheetSDK(config) {
    const node = this;
    RED.nodes.createNode(node, config);
    node.config = RED.nodes.getNode(config.config);

    node.on('input', async function (msg) {
      const resolved = resolvePayload(msg, config.payload);
      const { error, value } = validateObjectSchema(actionsPayloadSchema[config.action], resolved)
      if (error) {
        msg.payload = { error };
        node.send([msg, null]);
        return;
      }
      try {
        const sheetURL = getTypedFieldValue(msg, config.sheetURL);

        const result = await handlers[config.action](
          node.config.creds,
          parseGSheetUrl(sheetURL),
          value,
        );
        if (result) {
          msg.payload = result;
        }
        node.send([null, msg]);
      } catch (e) {
        console.log(e);
        msg.payload = { error: e.message };
        node.send([msg, null]);
      }
    })
  }

  RED.nodes.registerType("gsheets-sdk", GSheetSDK);
}
