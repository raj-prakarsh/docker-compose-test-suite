const appInsights = require("applicationinsights");
const express = require("express");
const app = express();
const templates = require("./modules/templates");
const api = require("./modules/api");
const about = require("./config/version");
const logger = require("./modules/logger");
const httpResponse = require("./modules/httpResponse");
const os = require("os");
const packageFile = require("./package.json");

/**
 * Gets the value passed in env DOMAIN_OWNERSHIP_VERIFICATION_FILE
 * to use as path for ownership verification.
 * Example: /97823o4i723bus6dtg34.txt
 * Defaults to _DOMAIN_OWNERSHIP_VERIFICATION_FILE_not_defined.
 */
app.getOwnershipVerificationPath = function() {
  return process.env.DOMAIN_OWNERSHIP_VERIFICATION_FILE
    ? process.env.DOMAIN_OWNERSHIP_VERIFICATION_FILE
    : "_DOMAIN_OWNERSHIP_VERIFICATION_FILE_not_defined";
};

/**
 * Gets the value passed in env DOMAIN_OWNERSHIP_VERIFICATION_FILE_CONTENT
 * to use as body for ownership verification.
 * Defaults to empty string.
 */
app.getOwnershipVerificationPathBodyContent = function() {
  return process.env.DOMAIN_OWNERSHIP_VERIFICATION_FILE_CONTENT
    ? process.env.DOMAIN_OWNERSHIP_VERIFICATION_FILE_CONTENT
    : "";
};

/**
 * If env DOMAIN_OWNERSHIP_VERIFICATION_FILE ends with .txt mine type text/plain is used.
 * Defaults to text/html.
 */
app.getOwnershipVerificationPathMimeType = function() {
  return app.getOwnershipVerificationPath().endsWith(".txt")
    ? httpResponse.contentTypes.PLAIN_TEXT
    : httpResponse.contentTypes.HTML;
};

/**
 * Init a Azure Application Insights if a key is passed as env APPINSIGHTS_INSTRUMENTATIONKEY
 */
app.initApplicationInsights = function() {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights
      .setup()
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();
    logger.log.info(
      `Using Application Ingsights: '${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}'.`
    );
  } else {
    logger.log.info(`Application Ingsights not used.`);
  }
};

/**
 * Start server on port 80, or use port specifed in env PORT.
 */
app.getListenPort = function() {
  return process.env.PORT ? process.env.PORT : 80;
};

/**
 * Start the server on configured port.
 */
app.listen(app.getListenPort(), function() {
  logger.log.info(
    `Started ${packageFile.name} on ${os.hostname()}:${app.getListenPort()}`
  );
  app.initApplicationInsights();
});

/********************* routes **************************/

/**
 * Index page.
 */
app.get("/", function(request, response) {
  httpResponse.ok(request, response, templates.index());
});

/**
 * About page. Versions and such.
 */
app.get("/_about", function(request, response) {
  httpResponse.ok(request, response, templates._about());
});

/**
 * Health check route.
 */
app.get("/_monitor", function(request, response) {
  httpResponse.ok(
    request,
    response,
    templates._monitor(),
    httpResponse.contentTypes.PLAIN_TEXT
  );
});

/**
 * Cluster IPs (ops)
 */
app.get("/_clusters", function(request, response) {
  httpResponse.ok(
    request,
    response,
    templates._clusters(),
    httpResponse.contentTypes.JSON
  );
});

/**
 * Crawler access definitions.
 */
app.get("/robots.txt", function(request, response) {
  httpResponse.ok(
    request,
    response,
    templates.robotstxt(),
    httpResponse.contentTypes.PLAIN_TEXT
  );
});

/**
 * Unique path to verify ownership of domain.
 */
app.get(`/${app.getOwnershipVerificationPath()}`, function(request, response) {
  logger.log.info(
    `Domain verification response '${app.getOwnershipVerificationPathBodyContent()}'.`
  );
  httpResponse.ok(
    request,
    response,
    app.getOwnershipVerificationPathBodyContent(),
    app.getOwnershipVerificationPathMimeType()
  );
});

/**
 * Get information about an application that is suppose to be
 * proxied by not working for a pathname. The information is displayd to the end user.
 * Normally this information contains the application name and a expected
 * maximum downtime for the missing service.
 */
app.get("/_application", function(request, response) {
  return api.getApplication(request, response, request.query.pathname);
});

/**
 * Generic error page for 5xx response codes.
 * Includes application information route /_application.
 */
app.get("/error5xx.html", function(request, response) {
  httpResponse.internalServerError(
    request,
    response,
    templates.error5xx(request)
  );
});

/**
 * Ignore favicons.
 */
app.get("/favicon.ico", function(request, response) {
  httpResponse.noContent(request, response);
});

/**
 * Default route, if no other route is matched (404 Not Found).
 */
app.use(function(request, response) {
  httpResponse.notFound(request, response, templates.error404());
});
