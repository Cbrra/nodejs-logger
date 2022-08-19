# nodejs-logger
Custom Node.js logger

### Dependencies
You need chalk@4.1.2 and moment

### How to use
```js
const { Logger } = require("pathToTheLogger/index");

const logger = new Logger({
    path: "process.log"
});

logger.debug("MainProcess", __filename, "Works !");
logger.log("MainProcess", __filename, "Works !");
logger.info("MainProcess", __filename, "Works !");
logger.success("MainProcess", __filename, "Works !");
logger.warn("MainProcess", __filename, "Works !");
logger.error("MainProcess", __filename, "Works !");
logger.log("InvisibleMainProcess", __filename, "Invisible Works !");
```
