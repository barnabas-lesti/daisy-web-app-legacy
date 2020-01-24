const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const logger = require('./logger');

const expressApp = express();

console.log(config);

class App {
  async start () {
    logger.info(`Using configuration: "${config.ENV}"`);

    expressApp.use('*', [
      bodyParser.json(),
    ]);

    const server = await expressApp.listen(config.private.PORT);
    const { address } = server.address();
    logger.info(`Server running at http://${address}:${config.private.PORT}`);
  }
}

module.exports = new App();
