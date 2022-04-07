# Global rollun utils for node-red

This repository contains 2 file:
- [frontend utils](./global-frontend-utils.js) - utils for frontend nodes
- [backend utils](./global-backend-utils.js) - utils for backend nodes

### Usage

#### Frontend utils
To use frontend utils, you need to import script with utils from rollun AWS S3 bucket in any frontend node.
```html
<script src="https://node-red-rollun.s3.eu-central-1.amazonaws.com/global-frontend-utils.js"></script>
```

#### Backend utils
To use frontend utils, you need to import npm package in you js file.
```js
const utils = require('node-red-contrib-rollun-global-utils');
```

### Deployment

#### Frontend utils
To deploy new changes to frontend utils, just edit [frontend utils file](./global-frontend-utils.js),
and push your changes to master branch, this will trigger [deploy action](../.github/workflows/deploy-frontend-utils.yml),
which deploys [frontend utils file](./global-frontend-utils.js) to AWS S3 bucket.

#### Backend utils
To deploy new changes to backend utils, just edit [backend utils file](./global-backend-utils.js),
and push your changes to master branch, this will trigger [deploy action](../.github/workflows/deploy-backend-utils.yml), 
which deploys [backend utils file](./global-backend-utils.js) to AWS S3 bucket.
