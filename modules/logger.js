const logger = require("kth-node-log");
const packageFile = require("../package.json");

/**
 * Gets the log level passed as env LOG_LEVEL
 * or defaults to info.
 *
 * Levels are:
 * log.info('hello from info, log level usually used in setup')
 * log.warn('error that code handled and can recover from')
 * log.error({err: err}, 'error that should be fixed in code')
 * log.fatal('a really bad error that will crash the application')
 * log.debug({req: request, res: res}, 'log a request and response, basic dev log')
 * log.trace('granular logging, rarely used')
 */
let _getLogLevel = function getLogLevel() {

    result = "info";

    if (process.env.LOG_LEVEL != null) {
        result = process.env.LOG_LEVEL;
    }

    console.log(`Loglevel: '${result}'`);

    return result;

};

/**
 * Set logging to the level specified in env LOG_LEVEL
 * or use default.
 */
logger.init({
    name: packageFile.name,
    app: packageFile.name,
    level: _getLogLevel()
});

/**
 * Log incomming request.
 * E.g:  http://localhost:3000/_about - Response Code: 200, Client IP: 127.0.0.1
 */
let _logRequest = function logRequest(request, statusCode, clientIp) {
    logger.info(`${request.method} ${request.protocol}://${request.get("Host")}${request.url} - Response: ${statusCode}, Client IP: ${clientIp}`);
    logger.debug(`Request headers: ${JSON.stringify(request.headers)}`);
};

/**
 * Module exports
 */
module.exports = {
    log: logger,
    logRequest: _logRequest
};