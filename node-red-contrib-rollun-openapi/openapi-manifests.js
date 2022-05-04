const express = require("express");
const ExpressOpenapiValidator = require("express-openapi-validator");
const objectHash = require("object-hash");
const openApiSchemaValidator = require("openapi-schema-validator");
const helpers = require("./helpers");
const axios = require('axios');
const YAML = require('yaml')
const { defaultLogger, getLifecycleToken } = require('node-red-contrib-rollun-backend-utils');

module.exports = function register(RED) {
  const schemaValidator = new openApiSchemaValidator.default({
    version: 3,
  });

  const mainRouter = express.Router();
  if (RED.httpNode) {
    RED.httpNode.use(mainRouter);
  }

  RED.nodes.registerType('rollun-openapi-manifest', function openapiSchemaNode(props) {
    const _this = this;
    RED.nodes.createNode(this, props);
    if (props.schema == null) {
      return;
    }
    const schema = props.schema;
    const result = schemaValidator.validate(schema);
    if (result.errors.length > 0) {
      this.error('Invalid OpenAPI schema:');
      result.errors.forEach(function (err) {
        _this.error('    ', err.message);
      });
      return;
    }
    const router = express.Router();
    const routes = [];
    this.baseURL = props.baseURL;
    this.schema = props.schema;
    this.router = function (fn) {
      routes.push(fn);
    };
    if (this.baseURL && this.baseURL !== '/') {
      mainRouter.use(this.baseURL, router);
    } else {
      mainRouter.use(router);
    }
    console.log(ExpressOpenapiValidator);
    const validator = new ExpressOpenapiValidator.OpenApiValidator({
      apiSpec: schema,
      validateRequests: true,
      validateResponses: true,
    });

    validator.install(router).then(function () {
      routes.forEach(function (r) {
        return r(router);
      });
      routes.length = 0;
      router.use(function (err, req, res, next) {
        // it's an error from the middleware
        if (err.status === 404 && req.openapi != null) {
          return next();
        }
        const errors = err.errors || [];
        const formatted = errors.map(({ path, message }) => ({
          level: 'error',
          // type: path.includes('response')
          //   ? 'OPENAPI_RESPONSE_VALIDATION_ERROR'
          //   : path.includes('request')
          //     ? 'OPENAPI_REQUEST_VALIDATION_ERROR'
          //     : 'OPENAPI_VALIDATION_ERROR',
          type: 'UNDEFINED',
          text: `[${path}] ${message}`,
        }));
        const { lToken, plToken = '' } = getLifecycleToken({ req });

        res.set('lifecycle_token', lToken);
        res.set('parent_lifecycle_token', plToken);
        res.status(500).json({ data: null, messages: formatted });
        res.errorLogged = true;
        defaultLogger.withMsg({ req })(
          'error',
          `OpenAPIServerRes: ${req.method} ${req.path}`,
          { status: 500, messages: formatted, err: err.stack },
        );
      });
    });
    this.on('close', function () {
      router.stack.length = 0;
      mainRouter.stack.forEach(function (route, i, routes) {
        if (route.handle === router) {
          routes.splice(i, 1);
        }
      });
    });
  });
  if (RED.httpAdmin != null) {
    RED.httpAdmin.get('/openapi/:id/paths', function (req, res) {
      const schema = helpers.findSchema(RED, req.params.id);
      if (!schema) {
        return res.status(404).end();
      }
      return res.status(200).send(schema.paths);
    });
    RED.httpAdmin.post('/openapi/compare', function (req, res) {
      if (!req.body) {
        return res.status(400).end();
      }
      const { current, next } = req.body;
      if (!current || !next) {
        return res.status(400).end();
      }
      const currentHash = objectHash(current);
      const otherHash = objectHash(next);
      return res.status(200).send(currentHash === otherHash);
    });
    RED.httpAdmin.post('/openapi/validate', function (req, res) {
      const schema = req.body;
      if (!schema) {
        return res.status(400).end();
      }
      return res.json(schemaValidator.validate(schema));
    });

    function parseManifest(data) {
      if (typeof data === 'object') {
        return data;
      }
      try {
        return JSON.parse(data);
      } catch (e1) {
        try {
          return YAML.parse(data);
        } catch (e2) {
          console.log(e1, e2, data);
          throw new Error('unable to parse manifest');
        }
      }
    }

    RED.httpAdmin.get('/openapi/fetch', async function (req, res) {
      const { url } = req.query;
      try {
        const { data } = await axios.get(url);
        const schema = parseManifest(data);
        const errors = schemaValidator.validate(schema);
        if (errors.length > 0) {
          throw new Error(`manifest validation error: ${JSON.stringify(errors)}`)
        }
        return res.send(schema);
      } catch (e) {
        return res.status(500).send({ error: e.message });
      }
    });
  }
};
