var should = require('should');
var helper = require('node-red-node-test-helper');
var node = require('../node.js');

helper.init(require.resolve('node-red'));

describe('autodist-api-v062 node', function () {

    before(function (done) {
        helper.startServer(done);
    });

    after(function (done) {
        helper.stopServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062' }];
        helper.load(node, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'autodist-api-v062');
            done();
        });
    });

    it('should handle avail()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'avail',
                avail_authorization: '<node property>', // (1) define node properties
                avail_number: '<node property>', // (1) define node properties
                avail_quantity: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle calculateOrderTotal()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'calculateOrderTotal',
                calculateOrderTotal_authorization: '<node property>', // (1) define node properties
                calculateOrderTotal_body: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle createOrder()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'createOrder',
                createOrder_authorization: '<node property>', // (1) define node properties
                createOrder_body: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle find()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'find',
                find_authorization: '<node property>', // (1) define node properties
                find_orderNumbers: '<node property>', // (1) define node properties
                find_purchaseNumbers: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle findRange()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'findRange',
                findRange_authorization: '<node property>', // (1) define node properties
                findRange_dateType: '<node property>', // (1) define node properties
                findRange_endDate: '<node property>', // (1) define node properties
                findRange_startDate: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle headers()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'headers',
                headers_authorization: '<node property>', // (1) define node properties
                headers_orderNumbers: '<node property>', // (1) define node properties
                headers_purchaseNumbers: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle cancelOrderByNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'cancelOrderByNumber',
                cancelOrderByNumber_authorization: '<node property>', // (1) define node properties
                cancelOrderByNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle getOrderByNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'getOrderByNumber',
                getOrderByNumber_authorization: '<node property>', // (1) define node properties
                getOrderByNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle trackingNumbersByOrderNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'trackingNumbersByOrderNumber',
                trackingNumbersByOrderNumber_authorization: '<node property>', // (1) define node properties
                trackingNumbersByOrderNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle cancelOrderByPurchaseNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'cancelOrderByPurchaseNumber',
                cancelOrderByPurchaseNumber_authorization: '<node property>', // (1) define node properties
                cancelOrderByPurchaseNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle getOrderByPurchaseNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'getOrderByPurchaseNumber',
                getOrderByPurchaseNumber_authorization: '<node property>', // (1) define node properties
                getOrderByPurchaseNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
    it('should handle trackingNumbersByPurchaseNumber()', function (done) {
        var flow = [
            { id: 'n1', type: 'autodist-api-v062', name: 'autodist-api-v062',
                method: 'trackingNumbersByPurchaseNumber',
                trackingNumbersByPurchaseNumber_authorization: '<node property>', // (1) define node properties
                trackingNumbersByPurchaseNumber_order: '<node property>', // (1) define node properties
                wires: [['n3']],
                service: 'n2' },
            { id: 'n2', type: 'autodist-api-v062-service', host: 'http://<host name>' }, // (4) define host name
            { id: 'n3', type: 'helper' }
        ];
        helper.load(node, flow, function () {
            var n3 = helper.getNode('n3');
            var n1 = helper.getNode('n1');
            n3.on('input', function (msg) {
                try {
                    msg.should.have.property('payload', '<output message>'); // (3) define output message
                    done();
                } catch (e) {
                    done(e);
                }
            });
            n1.receive({ payload: '<input message>' }); // (2) define input message
        });
    });
});
