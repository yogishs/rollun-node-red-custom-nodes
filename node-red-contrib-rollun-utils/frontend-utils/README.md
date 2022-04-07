# Utils for frontend part of node-red nodes

### Usage
To use frontend utils, you need to import a script with utils from rollun cdn in any frontend part of the node.
```html
<script src="https://node-red-rollun.s3.eu-central-1.amazonaws.com/global-frontend-utils.js"></script>
```

### Deployment
To deploy new changes to frontend utils, just edit [frontend utils file](frontend-utils.js),
and push your changes to master branch, this will trigger [deploy action](../../.github/workflows/deploy-frontend-utils.yml),
which deploys [frontend utils file](frontend-utils.js) to rollun cdn.
