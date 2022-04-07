# Utils for backend part of node-red nodes
This package contains utils for backend part of node-red nodes

### Usage
To use backend utils, you need to install npm package
```bash
npm install node-red-contrib-rollun-backend-utils
```
and that import npm package in you js file.
```js
const utils = require('node-red-contrib-rollun-backend-utils');
```

### Deployment 
To deploy new changes to backend utils, just edit package source code
and push your changes to master branch, this will trigger [deploy action](../../.github/workflows/deploy-backend-utils.yml),
which deploys this package to npm.  
