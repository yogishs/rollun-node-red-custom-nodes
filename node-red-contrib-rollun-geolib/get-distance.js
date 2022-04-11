const { getTypedFieldValue } = require('node-red-contrib-rollun-backend-utils')
const { getPreciseDistance } = require('geolib');
const _ = require('lodash');

module.exports = function (RED) {
  function GetDistance(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    function validatePoint(point) {
      const validateCoordinate = (coord) => coord && (typeof coord === 'number' || typeof coord === 'string');
      return !(!point || !point.latitude || !validateCoordinate(point.longitude) || !validateCoordinate(point.latitude));
    }

    node.on('input', function (msg) {
      const point1 = getTypedFieldValue(msg, config.point1);
      const point2 = getTypedFieldValue(msg, config.point2);
      const [, resultField] = (config.resultPath || 'msg|result').split('|');

      const coordDescription = 'Point must consist of 2 coordinates - latitude and longitude. each coordinate is a number or a string';
      if (!validatePoint(point1)) {
        _.set(msg, resultField, { error: `point1: ${coordDescription}` });
        return node.send([msg]);
      }

      if (!validatePoint(point2)) {
        _.set(msg, resultField, { error: `point2: ${coordDescription}` });
        return node.send([msg]);
      }

      try {
        const dist = getPreciseDistance(point1, point2);
        if (isNaN(dist)) {
          throw new Error(`unable to calculate distance. Probably one of the arguments is wrong`)
        }
        _.set(msg, resultField, dist);
        return node.send([null, msg]);
      } catch (e) {
        _.set(msg, resultField, { error: e.message });
        return node.send([msg]);
      }
    });
  }

  RED.nodes.registerType("get-distance", GetDistance);
};
