'use strict';
var lib = require('./lib.js');

module.exports = function (RED) {
    function AutodistApiV062Node(config) {
        RED.nodes.createNode(this, config);
        this.service = RED.nodes.getNode(config.service);
        this.method = config.method;
        this.avail_authorization = config.avail_authorization;
        this.avail_authorizationType = config.avail_authorizationType || 'str';
        this.avail_number = config.avail_number;
        this.avail_numberType = config.avail_numberType || 'str';
        this.avail_quantity = config.avail_quantity;
        this.avail_quantityType = config.avail_quantityType || 'str';
        this.calculateOrderTotal_authorization = config.calculateOrderTotal_authorization;
        this.calculateOrderTotal_authorizationType = config.calculateOrderTotal_authorizationType || 'str';
        this.calculateOrderTotal_body = config.calculateOrderTotal_body;
        this.calculateOrderTotal_bodyType = config.calculateOrderTotal_bodyType || 'str';
        this.createOrder_authorization = config.createOrder_authorization;
        this.createOrder_authorizationType = config.createOrder_authorizationType || 'str';
        this.createOrder_body = config.createOrder_body;
        this.createOrder_bodyType = config.createOrder_bodyType || 'str';
        this.find_authorization = config.find_authorization;
        this.find_authorizationType = config.find_authorizationType || 'str';
        this.find_orderNumbers = config.find_orderNumbers;
        this.find_orderNumbersType = config.find_orderNumbersType || 'str';
        this.find_purchaseNumbers = config.find_purchaseNumbers;
        this.find_purchaseNumbersType = config.find_purchaseNumbersType || 'str';
        this.findRange_authorization = config.findRange_authorization;
        this.findRange_authorizationType = config.findRange_authorizationType || 'str';
        this.findRange_dateType = config.findRange_dateType;
        this.findRange_dateTypeType = config.findRange_dateTypeType || 'str';
        this.findRange_endDate = config.findRange_endDate;
        this.findRange_endDateType = config.findRange_endDateType || 'str';
        this.findRange_startDate = config.findRange_startDate;
        this.findRange_startDateType = config.findRange_startDateType || 'str';
        this.headers_authorization = config.headers_authorization;
        this.headers_authorizationType = config.headers_authorizationType || 'str';
        this.headers_orderNumbers = config.headers_orderNumbers;
        this.headers_orderNumbersType = config.headers_orderNumbersType || 'str';
        this.headers_purchaseNumbers = config.headers_purchaseNumbers;
        this.headers_purchaseNumbersType = config.headers_purchaseNumbersType || 'str';
        this.cancelOrderByNumber_authorization = config.cancelOrderByNumber_authorization;
        this.cancelOrderByNumber_authorizationType = config.cancelOrderByNumber_authorizationType || 'str';
        this.cancelOrderByNumber_order = config.cancelOrderByNumber_order;
        this.cancelOrderByNumber_orderType = config.cancelOrderByNumber_orderType || 'str';
        this.getOrderByNumber_authorization = config.getOrderByNumber_authorization;
        this.getOrderByNumber_authorizationType = config.getOrderByNumber_authorizationType || 'str';
        this.getOrderByNumber_order = config.getOrderByNumber_order;
        this.getOrderByNumber_orderType = config.getOrderByNumber_orderType || 'str';
        this.trackingNumbersByOrderNumber_authorization = config.trackingNumbersByOrderNumber_authorization;
        this.trackingNumbersByOrderNumber_authorizationType = config.trackingNumbersByOrderNumber_authorizationType || 'str';
        this.trackingNumbersByOrderNumber_order = config.trackingNumbersByOrderNumber_order;
        this.trackingNumbersByOrderNumber_orderType = config.trackingNumbersByOrderNumber_orderType || 'str';
        this.cancelOrderByPurchaseNumber_authorization = config.cancelOrderByPurchaseNumber_authorization;
        this.cancelOrderByPurchaseNumber_authorizationType = config.cancelOrderByPurchaseNumber_authorizationType || 'str';
        this.cancelOrderByPurchaseNumber_order = config.cancelOrderByPurchaseNumber_order;
        this.cancelOrderByPurchaseNumber_orderType = config.cancelOrderByPurchaseNumber_orderType || 'str';
        this.getOrderByPurchaseNumber_authorization = config.getOrderByPurchaseNumber_authorization;
        this.getOrderByPurchaseNumber_authorizationType = config.getOrderByPurchaseNumber_authorizationType || 'str';
        this.getOrderByPurchaseNumber_order = config.getOrderByPurchaseNumber_order;
        this.getOrderByPurchaseNumber_orderType = config.getOrderByPurchaseNumber_orderType || 'str';
        this.trackingNumbersByPurchaseNumber_authorization = config.trackingNumbersByPurchaseNumber_authorization;
        this.trackingNumbersByPurchaseNumber_authorizationType = config.trackingNumbersByPurchaseNumber_authorizationType || 'str';
        this.trackingNumbersByPurchaseNumber_order = config.trackingNumbersByPurchaseNumber_order;
        this.trackingNumbersByPurchaseNumber_orderType = config.trackingNumbersByPurchaseNumber_orderType || 'str';
        var node = this;

        node.on('input', function (msg) {
            var errorFlag = false;
            var client;
            if (this.service && this.service.host) {
                client = new lib.AutodistApiV062({ domain: this.service.host });
            } else {
                node.error('Host in configuration node is not specified.', msg);
                errorFlag = true;
            }
            if (!errorFlag) {
                client.body = msg.payload;
            }

            var result;
            if (!errorFlag && node.method === 'avail') {
                var avail_parameters = [];
                var avail_nodeParam;
                var avail_nodeParamType;

                avail_nodeParam = node.avail_authorization;
                avail_nodeParamType = node.avail_authorizationType;
                if (avail_nodeParamType === 'str') {
                    avail_parameters.authorization = avail_nodeParam || '';
                } else {
                    avail_parameters.authorization = RED.util.getMessageProperty(msg, avail_nodeParam);
                }
                avail_parameters.authorization = !!avail_parameters.authorization ? avail_parameters.authorization : msg.payload;
                
                avail_nodeParam = node.avail_number;
                avail_nodeParamType = node.avail_numberType;
                if (avail_nodeParamType === 'str') {
                    avail_parameters.number = avail_nodeParam || '';
                } else {
                    avail_parameters.number = RED.util.getMessageProperty(msg, avail_nodeParam);
                }
                avail_parameters.number = !!avail_parameters.number ? avail_parameters.number : msg.payload;
                
                avail_nodeParam = node.avail_quantity;
                avail_nodeParamType = node.avail_quantityType;
                if (avail_nodeParamType === 'str') {
                    avail_parameters.quantity = avail_nodeParam || '';
                } else {
                    avail_parameters.quantity = RED.util.getMessageProperty(msg, avail_nodeParam);
                }
                avail_parameters.quantity = !!avail_parameters.quantity ? avail_parameters.quantity : msg.payload;
                                result = client.avail(avail_parameters);
            }
            if (!errorFlag && node.method === 'calculateOrderTotal') {
                var calculateOrderTotal_parameters = [];
                var calculateOrderTotal_nodeParam;
                var calculateOrderTotal_nodeParamType;

                calculateOrderTotal_nodeParam = node.calculateOrderTotal_authorization;
                calculateOrderTotal_nodeParamType = node.calculateOrderTotal_authorizationType;
                if (calculateOrderTotal_nodeParamType === 'str') {
                    calculateOrderTotal_parameters.authorization = calculateOrderTotal_nodeParam || '';
                } else {
                    calculateOrderTotal_parameters.authorization = RED.util.getMessageProperty(msg, calculateOrderTotal_nodeParam);
                }
                calculateOrderTotal_parameters.authorization = !!calculateOrderTotal_parameters.authorization ? calculateOrderTotal_parameters.authorization : msg.payload;
                
                if (typeof msg.payload === 'object') {
                    calculateOrderTotal_parameters.body = msg.payload;
                } else {
                    node.error('Unsupported type: \'' + (typeof msg.payload) + '\', ' + 'msg.payload must be JSON object or buffer.', msg);
                    errorFlag = true;
                }
                                result = client.calculateOrderTotal(calculateOrderTotal_parameters);
            }
            if (!errorFlag && node.method === 'createOrder') {
                var createOrder_parameters = [];
                var createOrder_nodeParam;
                var createOrder_nodeParamType;

                createOrder_nodeParam = node.createOrder_authorization;
                createOrder_nodeParamType = node.createOrder_authorizationType;
                if (createOrder_nodeParamType === 'str') {
                    createOrder_parameters.authorization = createOrder_nodeParam || '';
                } else {
                    createOrder_parameters.authorization = RED.util.getMessageProperty(msg, createOrder_nodeParam);
                }
                createOrder_parameters.authorization = !!createOrder_parameters.authorization ? createOrder_parameters.authorization : msg.payload;
                
                if (typeof msg.payload === 'object') {
                    createOrder_parameters.body = msg.payload;
                } else {
                    node.error('Unsupported type: \'' + (typeof msg.payload) + '\', ' + 'msg.payload must be JSON object or buffer.', msg);
                    errorFlag = true;
                }
                                result = client.createOrder(createOrder_parameters);
            }
            if (!errorFlag && node.method === 'find') {
                var find_parameters = [];
                var find_nodeParam;
                var find_nodeParamType;

                find_nodeParam = node.find_authorization;
                find_nodeParamType = node.find_authorizationType;
                if (find_nodeParamType === 'str') {
                    find_parameters.authorization = find_nodeParam || '';
                } else {
                    find_parameters.authorization = RED.util.getMessageProperty(msg, find_nodeParam);
                }
                find_parameters.authorization = !!find_parameters.authorization ? find_parameters.authorization : msg.payload;
                
                find_nodeParam = node.find_orderNumbers;
                find_nodeParamType = node.find_orderNumbersType;
                if (find_nodeParamType === 'str') {
                    find_parameters.orderNumbers = find_nodeParam || '';
                } else {
                    find_parameters.orderNumbers = RED.util.getMessageProperty(msg, find_nodeParam);
                }
                find_parameters.orderNumbers = !!find_parameters.orderNumbers ? find_parameters.orderNumbers : msg.payload;
                
                find_nodeParam = node.find_purchaseNumbers;
                find_nodeParamType = node.find_purchaseNumbersType;
                if (find_nodeParamType === 'str') {
                    find_parameters.purchaseNumbers = find_nodeParam || '';
                } else {
                    find_parameters.purchaseNumbers = RED.util.getMessageProperty(msg, find_nodeParam);
                }
                find_parameters.purchaseNumbers = !!find_parameters.purchaseNumbers ? find_parameters.purchaseNumbers : msg.payload;
                                result = client.find(find_parameters);
            }
            if (!errorFlag && node.method === 'findRange') {
                var findRange_parameters = [];
                var findRange_nodeParam;
                var findRange_nodeParamType;

                findRange_nodeParam = node.findRange_authorization;
                findRange_nodeParamType = node.findRange_authorizationType;
                if (findRange_nodeParamType === 'str') {
                    findRange_parameters.authorization = findRange_nodeParam || '';
                } else {
                    findRange_parameters.authorization = RED.util.getMessageProperty(msg, findRange_nodeParam);
                }
                findRange_parameters.authorization = !!findRange_parameters.authorization ? findRange_parameters.authorization : msg.payload;
                
                findRange_nodeParam = node.findRange_dateType;
                findRange_nodeParamType = node.findRange_dateTypeType;
                if (findRange_nodeParamType === 'str') {
                    findRange_parameters.dateType = findRange_nodeParam || '';
                } else {
                    findRange_parameters.dateType = RED.util.getMessageProperty(msg, findRange_nodeParam);
                }
                findRange_parameters.dateType = !!findRange_parameters.dateType ? findRange_parameters.dateType : msg.payload;
                
                findRange_nodeParam = node.findRange_endDate;
                findRange_nodeParamType = node.findRange_endDateType;
                if (findRange_nodeParamType === 'str') {
                    findRange_parameters.endDate = findRange_nodeParam || '';
                } else {
                    findRange_parameters.endDate = RED.util.getMessageProperty(msg, findRange_nodeParam);
                }
                findRange_parameters.endDate = !!findRange_parameters.endDate ? findRange_parameters.endDate : msg.payload;
                
                findRange_nodeParam = node.findRange_startDate;
                findRange_nodeParamType = node.findRange_startDateType;
                if (findRange_nodeParamType === 'str') {
                    findRange_parameters.startDate = findRange_nodeParam || '';
                } else {
                    findRange_parameters.startDate = RED.util.getMessageProperty(msg, findRange_nodeParam);
                }
                findRange_parameters.startDate = !!findRange_parameters.startDate ? findRange_parameters.startDate : msg.payload;
                                result = client.findRange(findRange_parameters);
            }
            if (!errorFlag && node.method === 'headers') {
                var headers_parameters = [];
                var headers_nodeParam;
                var headers_nodeParamType;

                headers_nodeParam = node.headers_authorization;
                headers_nodeParamType = node.headers_authorizationType;
                if (headers_nodeParamType === 'str') {
                    headers_parameters.authorization = headers_nodeParam || '';
                } else {
                    headers_parameters.authorization = RED.util.getMessageProperty(msg, headers_nodeParam);
                }
                headers_parameters.authorization = !!headers_parameters.authorization ? headers_parameters.authorization : msg.payload;
                
                headers_nodeParam = node.headers_orderNumbers;
                headers_nodeParamType = node.headers_orderNumbersType;
                if (headers_nodeParamType === 'str') {
                    headers_parameters.orderNumbers = headers_nodeParam || '';
                } else {
                    headers_parameters.orderNumbers = RED.util.getMessageProperty(msg, headers_nodeParam);
                }
                headers_parameters.orderNumbers = !!headers_parameters.orderNumbers ? headers_parameters.orderNumbers : msg.payload;
                
                headers_nodeParam = node.headers_purchaseNumbers;
                headers_nodeParamType = node.headers_purchaseNumbersType;
                if (headers_nodeParamType === 'str') {
                    headers_parameters.purchaseNumbers = headers_nodeParam || '';
                } else {
                    headers_parameters.purchaseNumbers = RED.util.getMessageProperty(msg, headers_nodeParam);
                }
                headers_parameters.purchaseNumbers = !!headers_parameters.purchaseNumbers ? headers_parameters.purchaseNumbers : msg.payload;
                                result = client.headers(headers_parameters);
            }
            if (!errorFlag && node.method === 'cancelOrderByNumber') {
                var cancelOrderByNumber_parameters = [];
                var cancelOrderByNumber_nodeParam;
                var cancelOrderByNumber_nodeParamType;

                cancelOrderByNumber_nodeParam = node.cancelOrderByNumber_authorization;
                cancelOrderByNumber_nodeParamType = node.cancelOrderByNumber_authorizationType;
                if (cancelOrderByNumber_nodeParamType === 'str') {
                    cancelOrderByNumber_parameters.authorization = cancelOrderByNumber_nodeParam || '';
                } else {
                    cancelOrderByNumber_parameters.authorization = RED.util.getMessageProperty(msg, cancelOrderByNumber_nodeParam);
                }
                cancelOrderByNumber_parameters.authorization = !!cancelOrderByNumber_parameters.authorization ? cancelOrderByNumber_parameters.authorization : msg.payload;
                
                cancelOrderByNumber_nodeParam = node.cancelOrderByNumber_order;
                cancelOrderByNumber_nodeParamType = node.cancelOrderByNumber_orderType;
                if (cancelOrderByNumber_nodeParamType === 'str') {
                    cancelOrderByNumber_parameters.order = cancelOrderByNumber_nodeParam || '';
                } else {
                    cancelOrderByNumber_parameters.order = RED.util.getMessageProperty(msg, cancelOrderByNumber_nodeParam);
                }
                cancelOrderByNumber_parameters.order = !!cancelOrderByNumber_parameters.order ? cancelOrderByNumber_parameters.order : msg.payload;
                                result = client.cancelOrderByNumber(cancelOrderByNumber_parameters);
            }
            if (!errorFlag && node.method === 'getOrderByNumber') {
                var getOrderByNumber_parameters = [];
                var getOrderByNumber_nodeParam;
                var getOrderByNumber_nodeParamType;

                getOrderByNumber_nodeParam = node.getOrderByNumber_authorization;
                getOrderByNumber_nodeParamType = node.getOrderByNumber_authorizationType;
                if (getOrderByNumber_nodeParamType === 'str') {
                    getOrderByNumber_parameters.authorization = getOrderByNumber_nodeParam || '';
                } else {
                    getOrderByNumber_parameters.authorization = RED.util.getMessageProperty(msg, getOrderByNumber_nodeParam);
                }
                getOrderByNumber_parameters.authorization = !!getOrderByNumber_parameters.authorization ? getOrderByNumber_parameters.authorization : msg.payload;
                
                getOrderByNumber_nodeParam = node.getOrderByNumber_order;
                getOrderByNumber_nodeParamType = node.getOrderByNumber_orderType;
                if (getOrderByNumber_nodeParamType === 'str') {
                    getOrderByNumber_parameters.order = getOrderByNumber_nodeParam || '';
                } else {
                    getOrderByNumber_parameters.order = RED.util.getMessageProperty(msg, getOrderByNumber_nodeParam);
                }
                getOrderByNumber_parameters.order = !!getOrderByNumber_parameters.order ? getOrderByNumber_parameters.order : msg.payload;
                                result = client.getOrderByNumber(getOrderByNumber_parameters);
            }
            if (!errorFlag && node.method === 'trackingNumbersByOrderNumber') {
                var trackingNumbersByOrderNumber_parameters = [];
                var trackingNumbersByOrderNumber_nodeParam;
                var trackingNumbersByOrderNumber_nodeParamType;

                trackingNumbersByOrderNumber_nodeParam = node.trackingNumbersByOrderNumber_authorization;
                trackingNumbersByOrderNumber_nodeParamType = node.trackingNumbersByOrderNumber_authorizationType;
                if (trackingNumbersByOrderNumber_nodeParamType === 'str') {
                    trackingNumbersByOrderNumber_parameters.authorization = trackingNumbersByOrderNumber_nodeParam || '';
                } else {
                    trackingNumbersByOrderNumber_parameters.authorization = RED.util.getMessageProperty(msg, trackingNumbersByOrderNumber_nodeParam);
                }
                trackingNumbersByOrderNumber_parameters.authorization = !!trackingNumbersByOrderNumber_parameters.authorization ? trackingNumbersByOrderNumber_parameters.authorization : msg.payload;
                
                trackingNumbersByOrderNumber_nodeParam = node.trackingNumbersByOrderNumber_order;
                trackingNumbersByOrderNumber_nodeParamType = node.trackingNumbersByOrderNumber_orderType;
                if (trackingNumbersByOrderNumber_nodeParamType === 'str') {
                    trackingNumbersByOrderNumber_parameters.order = trackingNumbersByOrderNumber_nodeParam || '';
                } else {
                    trackingNumbersByOrderNumber_parameters.order = RED.util.getMessageProperty(msg, trackingNumbersByOrderNumber_nodeParam);
                }
                trackingNumbersByOrderNumber_parameters.order = !!trackingNumbersByOrderNumber_parameters.order ? trackingNumbersByOrderNumber_parameters.order : msg.payload;
                                result = client.trackingNumbersByOrderNumber(trackingNumbersByOrderNumber_parameters);
            }
            if (!errorFlag && node.method === 'cancelOrderByPurchaseNumber') {
                var cancelOrderByPurchaseNumber_parameters = [];
                var cancelOrderByPurchaseNumber_nodeParam;
                var cancelOrderByPurchaseNumber_nodeParamType;

                cancelOrderByPurchaseNumber_nodeParam = node.cancelOrderByPurchaseNumber_authorization;
                cancelOrderByPurchaseNumber_nodeParamType = node.cancelOrderByPurchaseNumber_authorizationType;
                if (cancelOrderByPurchaseNumber_nodeParamType === 'str') {
                    cancelOrderByPurchaseNumber_parameters.authorization = cancelOrderByPurchaseNumber_nodeParam || '';
                } else {
                    cancelOrderByPurchaseNumber_parameters.authorization = RED.util.getMessageProperty(msg, cancelOrderByPurchaseNumber_nodeParam);
                }
                cancelOrderByPurchaseNumber_parameters.authorization = !!cancelOrderByPurchaseNumber_parameters.authorization ? cancelOrderByPurchaseNumber_parameters.authorization : msg.payload;
                
                cancelOrderByPurchaseNumber_nodeParam = node.cancelOrderByPurchaseNumber_order;
                cancelOrderByPurchaseNumber_nodeParamType = node.cancelOrderByPurchaseNumber_orderType;
                if (cancelOrderByPurchaseNumber_nodeParamType === 'str') {
                    cancelOrderByPurchaseNumber_parameters.order = cancelOrderByPurchaseNumber_nodeParam || '';
                } else {
                    cancelOrderByPurchaseNumber_parameters.order = RED.util.getMessageProperty(msg, cancelOrderByPurchaseNumber_nodeParam);
                }
                cancelOrderByPurchaseNumber_parameters.order = !!cancelOrderByPurchaseNumber_parameters.order ? cancelOrderByPurchaseNumber_parameters.order : msg.payload;
                                result = client.cancelOrderByPurchaseNumber(cancelOrderByPurchaseNumber_parameters);
            }
            if (!errorFlag && node.method === 'getOrderByPurchaseNumber') {
                var getOrderByPurchaseNumber_parameters = [];
                var getOrderByPurchaseNumber_nodeParam;
                var getOrderByPurchaseNumber_nodeParamType;

                getOrderByPurchaseNumber_nodeParam = node.getOrderByPurchaseNumber_authorization;
                getOrderByPurchaseNumber_nodeParamType = node.getOrderByPurchaseNumber_authorizationType;
                if (getOrderByPurchaseNumber_nodeParamType === 'str') {
                    getOrderByPurchaseNumber_parameters.authorization = getOrderByPurchaseNumber_nodeParam || '';
                } else {
                    getOrderByPurchaseNumber_parameters.authorization = RED.util.getMessageProperty(msg, getOrderByPurchaseNumber_nodeParam);
                }
                getOrderByPurchaseNumber_parameters.authorization = !!getOrderByPurchaseNumber_parameters.authorization ? getOrderByPurchaseNumber_parameters.authorization : msg.payload;
                
                getOrderByPurchaseNumber_nodeParam = node.getOrderByPurchaseNumber_order;
                getOrderByPurchaseNumber_nodeParamType = node.getOrderByPurchaseNumber_orderType;
                if (getOrderByPurchaseNumber_nodeParamType === 'str') {
                    getOrderByPurchaseNumber_parameters.order = getOrderByPurchaseNumber_nodeParam || '';
                } else {
                    getOrderByPurchaseNumber_parameters.order = RED.util.getMessageProperty(msg, getOrderByPurchaseNumber_nodeParam);
                }
                getOrderByPurchaseNumber_parameters.order = !!getOrderByPurchaseNumber_parameters.order ? getOrderByPurchaseNumber_parameters.order : msg.payload;
                                result = client.getOrderByPurchaseNumber(getOrderByPurchaseNumber_parameters);
            }
            if (!errorFlag && node.method === 'trackingNumbersByPurchaseNumber') {
                var trackingNumbersByPurchaseNumber_parameters = [];
                var trackingNumbersByPurchaseNumber_nodeParam;
                var trackingNumbersByPurchaseNumber_nodeParamType;

                trackingNumbersByPurchaseNumber_nodeParam = node.trackingNumbersByPurchaseNumber_authorization;
                trackingNumbersByPurchaseNumber_nodeParamType = node.trackingNumbersByPurchaseNumber_authorizationType;
                if (trackingNumbersByPurchaseNumber_nodeParamType === 'str') {
                    trackingNumbersByPurchaseNumber_parameters.authorization = trackingNumbersByPurchaseNumber_nodeParam || '';
                } else {
                    trackingNumbersByPurchaseNumber_parameters.authorization = RED.util.getMessageProperty(msg, trackingNumbersByPurchaseNumber_nodeParam);
                }
                trackingNumbersByPurchaseNumber_parameters.authorization = !!trackingNumbersByPurchaseNumber_parameters.authorization ? trackingNumbersByPurchaseNumber_parameters.authorization : msg.payload;
                
                trackingNumbersByPurchaseNumber_nodeParam = node.trackingNumbersByPurchaseNumber_order;
                trackingNumbersByPurchaseNumber_nodeParamType = node.trackingNumbersByPurchaseNumber_orderType;
                if (trackingNumbersByPurchaseNumber_nodeParamType === 'str') {
                    trackingNumbersByPurchaseNumber_parameters.order = trackingNumbersByPurchaseNumber_nodeParam || '';
                } else {
                    trackingNumbersByPurchaseNumber_parameters.order = RED.util.getMessageProperty(msg, trackingNumbersByPurchaseNumber_nodeParam);
                }
                trackingNumbersByPurchaseNumber_parameters.order = !!trackingNumbersByPurchaseNumber_parameters.order ? trackingNumbersByPurchaseNumber_parameters.order : msg.payload;
                                result = client.trackingNumbersByPurchaseNumber(trackingNumbersByPurchaseNumber_parameters);
            }
            if (!errorFlag && result === undefined) {
                node.error('Method is not specified.', msg);
                errorFlag = true;
            }
            var setData = function (msg, data) {
                if (data) {
                    if (data.response) {
                        if (data.response.statusCode) {
                            msg.statusCode = data.response.statusCode;
                        }
                        if (data.response.headers) {
                            msg.headers = data.response.headers;
                        }
                        if (data.response.request && data.response.request.uri && data.response.request.uri.href) {
                            msg.responseUrl = data.response.request.uri.href;
                        }
                    }
                    if (data.body) {
                        msg.payload = data.body;
                    }
                }
                return msg;
            };
            if (!errorFlag) {
                node.status({ fill: 'blue', shape: 'dot', text: 'AutodistApiV062.status.requesting' });
                result.then(function (data) {
                    node.send(setData(msg, data));
                    node.status({});
                }).catch(function (error) {
                    var message = null;
                    if (error && error.body && error.body.message) {
                        message = error.body.message;
                    }
                    node.error(message, setData(msg, error));
                    node.status({ fill: 'red', shape: 'ring', text: 'node-red:common.status.error' });
                });
            }
        });
    }

    RED.nodes.registerType('autodist-api-v062', AutodistApiV062Node);
    function AutodistApiV062ServiceNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;

    }

    RED.nodes.registerType('autodist-api-v062-service', AutodistApiV062ServiceNode, {
        credentials: {
            temp: { type: 'text' }
        }
    });
};
