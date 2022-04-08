/*jshint -W069 */
/**
 * <b>Possible error codes</b><br>HTTP 500 : E000 - Unspecified internal error<br>HTTP 401 : E001 - Authorization error<br>HTTP 423 : E002 - API access is disabled<br>HTTP 403 : E003 - Too Many Requests<br>HTTP 406 : E004 - HTTP is not allowed, use HTTPS instead<br>** HTTP 422 : E005 - The item number is restricted for processing<br>HTTP 400 : E100 - Validation error<br>HTTP 503 : E200 - Unspecified Gateway service error<br>HTTP 404 : E201 - Not found on the Gateway service side<br>HTTP 400 : E202 - No shipping options available
 * @class AutodistApiV062
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var AutodistApiV062 = (function(){
    'use strict';

    var request = require('request');
    var Q = require('q');
    var fileType = require('file-type');

    function AutodistApiV062(options){
        var domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : '';
        if(this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
    }

    function mergeQueryParams(parameters, queryParameters) {
        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                  .forEach(function(parameterName) {
                      var parameter = parameters.$queryParameters[parameterName];
                      queryParameters[parameterName] = parameter;
            });
        }
        return queryParameters;
    }

    /**
     * HTTP Request
     * @method
     * @name AutodistApiV062#request
     * @param {string} method - http method
     * @param {string} url - url to do request
     * @param {object} parameters
     * @param {object} body - body parameters / object
     * @param {object} headers - header parameters
     * @param {object} queryParameters - querystring parameters
     * @param {object} form - form data object
     * @param {object} deferred - promise object
     */
    AutodistApiV062.prototype.request = function(method, url, parameters, body, headers, queryParameters, form, deferred){
        var req = {
            method: method,
            uri: url,
            qs: queryParameters,
            headers: headers,
            body: body
        };
        if(Object.keys(form).length > 0) {
            if (req.headers['Content-Type'] && req.headers['Content-Type'][0] === 'multipart/form-data') {
                delete req.body;
                var keyName = Object.keys(form)[0]
                req.formData = {
                    [keyName]: {
                        value: form[keyName],
                        options: {
                            filename: (fileType(form[keyName]) != null ? `file.${ fileType(form[keyName]).ext }` : `file` )
                        }
                    }
                };
            } else {
                req.form = form;
            }
        }
        if(typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body){
            if(error) {
                deferred.reject(error);
            } else {
                if(/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch(e) {}
                }
                if(response.statusCode === 204) {
                    deferred.resolve({ response: response });
                } else if(response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({ response: response, body: body });
                } else {
                    deferred.reject({ response: response, body: body });
                }
            }
        });
    };


/**
 * Availability check for item with the given number
 * @method
 * @name AutodistApiV062#avail
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.number - item number
     * @param {integer} parameters.quantity - quantity of items required (optional)
 */
 AutodistApiV062.prototype.avail = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/item/avail/{number}';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{number}', parameters['number']);
        
        


        if(parameters['number'] === undefined){
            deferred.reject(new Error('Missing required  parameter: number'));
            return deferred.promise;
        }
 

                if(parameters['quantity'] !== undefined){
                    queryParameters['quantity'] = parameters['quantity'];
                }
        
        
        


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Calculate order parameters without order creation
 * @method
 * @name AutodistApiV062#calculateOrderTotal
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {} parameters.body - input data, contains order parameters.
 */
 AutodistApiV062.prototype.calculateOrderTotal = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/calculate';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];
        headers['Content-Type'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
        
        
            if(parameters['body'] !== undefined){
                body = parameters['body'];
            }


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Create order with given parameters
 * @method
 * @name AutodistApiV062#createOrder
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {} parameters.body - input data, contains order parameters.
 */
 AutodistApiV062.prototype.createOrder = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/create';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];
        headers['Content-Type'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
        
        
            if(parameters['body'] !== undefined){
                body = parameters['body'];
            }


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Bulk retrieve the orders by order numbers and/or order purchase numbers
 * @method
 * @name AutodistApiV062#find
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {array} parameters.orderNumbers - order numbers
     * @param {array} parameters.purchaseNumbers - purchase order numbers
 */
 AutodistApiV062.prototype.find = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/find';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 

                if(parameters['orderNumbers'] !== undefined){
                    queryParameters['orderNumbers'] = parameters['orderNumbers'];
                }
        
        
        


 

                if(parameters['purchaseNumbers'] !== undefined){
                    queryParameters['purchaseNumbers'] = parameters['purchaseNumbers'];
                }
        
        
        


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Bulk retrieve the orders by invoice or created date range
 * @method
 * @name AutodistApiV062#findRange
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.dateType - date type identifier <code>I</code> for invoice, <code>C</code> for created
     * @param {string} parameters.endDate - date range end
     * @param {string} parameters.startDate - date range start
 */
 AutodistApiV062.prototype.findRange = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/find/range';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 

                if(parameters['dateType'] !== undefined){
                    queryParameters['dateType'] = parameters['dateType'];
                }
        
        
        


 

                if(parameters['endDate'] !== undefined){
                    queryParameters['endDate'] = parameters['endDate'];
                }
        
        
        


 

                if(parameters['startDate'] !== undefined){
                    queryParameters['startDate'] = parameters['startDate'];
                }
        
        
        


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Bulk retrieve the order statuses by order numbers and/or order purchase numbers. Intended to track the order statuses and tracking numbers quickly.
 * @method
 * @name AutodistApiV062#headers
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {array} parameters.orderNumbers - order numbers
     * @param {array} parameters.purchaseNumbers - purchase order numbers
 */
 AutodistApiV062.prototype.headers = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/headers';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 

                if(parameters['orderNumbers'] !== undefined){
                    queryParameters['orderNumbers'] = parameters['orderNumbers'];
                }
        
        
        


 

                if(parameters['purchaseNumbers'] !== undefined){
                    queryParameters['purchaseNumbers'] = parameters['purchaseNumbers'];
                }
        
        
        


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Cancel order info by order number
 * @method
 * @name AutodistApiV062#cancelOrderByNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - order number
 */
 AutodistApiV062.prototype.cancelOrderByNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/number/cancel/{order}';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Retrieve order info by order number
 * @method
 * @name AutodistApiV062#getOrderByNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - order number
 */
 AutodistApiV062.prototype.getOrderByNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/number/{order}';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Get order's tracking numbers
 * @method
 * @name AutodistApiV062#trackingNumbersByOrderNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - order number
 */
 AutodistApiV062.prototype.trackingNumbersByOrderNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/number/{order}/tracking-numbers';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Cancel order info by order purchase number
 * @method
 * @name AutodistApiV062#cancelOrderByPurchaseNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - order purchase number
 */
 AutodistApiV062.prototype.cancelOrderByPurchaseNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/purchase-number/cancel/{order}';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Retrieve order info by order purchase number
 * @method
 * @name AutodistApiV062#getOrderByPurchaseNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - order number
 */
 AutodistApiV062.prototype.getOrderByPurchaseNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/purchase-number/{order}';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };
/**
 * Get order's tracking numbers
 * @method
 * @name AutodistApiV062#trackingNumbersByPurchaseNumber
 * @param {object} parameters - method options and parameters
     * @param {string} parameters.authorization - Your API key
     * @param {string} parameters.order - purchase order number
 */
 AutodistApiV062.prototype.trackingNumbersByPurchaseNumber = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/order/purchase-number/{order}/tracking-numbers';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];

        
        
                if(parameters['authorization'] !== undefined){
                    headers['Authorization'] = parameters['authorization'];
                }
        


 
        
            path = path.replace('{order}', parameters['order']);
        
        


        if(parameters['order'] === undefined){
            deferred.reject(new Error('Missing required  parameter: order'));
            return deferred.promise;
        }
 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };

    return AutodistApiV062;
})();

exports.AutodistApiV062 = AutodistApiV062;
