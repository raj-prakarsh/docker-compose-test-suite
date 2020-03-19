"use strict";

const https = require("https");
const logger = require("./logger");
const httpResponse = require("./httpResponse");

/**
 * Gets the cluster name to used when building the path for calling
 * api.kth.se/api/pipeline/v1/search/[active|stage|integral|saas|on-prem].
 * Defaults to active.
 */
const _getCluster = () => {
  return process.env.PORTILLO_CLUSTER ? process.env.PORTILLO_CLUSTER : "active";
};

/**
 * Gets the host that runs the api we are calling.
 * Defaults to api.kth.se
 */
const _applicationsApiHost = () => {
  const result = process.env.APPLICATIONS_API_HOST
    ? process.env.APPLICATIONS_API_HOST
    : "api.kth.se";
  logger.log.info(`Hostname for searching '${result}'.`);
  return result;
};

/**
 * Gets the path to the api endpoint we are calling.
 */
const _getSearchPath = uriQuery => {
  const result = `/api/pipeline/v1/search/${_getCluster()}/${encodeURIComponent(
    uriQuery
  )}`;
  logger.log.info(`Path for searching '${result}'.`);
  return result;
};

/**
 * Gets the options including headers (api key) to pass to the api called.
 */
const getOptions = uriQuery => {
  return {
    hostname: _applicationsApiHost(),
    path: _getSearchPath(uriQuery),
    headers: {
      api_key: process.env.APPLICATIONS_API_KEY
    }
  };
};

/**
 * Gets information about an application based on the uriQuery passed.
 * Ex:
 * For app.kth.se/my-application/admin/page=1 the uri query '/my-application/admin/page=1' will be sent to the api
 * which returns information about tha application. The information returned will be the  first match
 * for applications hows path starts with "path": "/my-application/".
 *
 * Example result from API:
 * {
 *  "applicationName": "My Application",
 *  "created": 1548164635.178028,
 *  "clusterName": "active",
 *  "version": "1.2.701_a538576",
 *  "path": "/my-application/",
 *  "slackChannels": "#team-developers",
 *  "importance": "high",
 *  "publicNameEnglish": "My Application,
 *  "publicNameSwedish": "Min application",
 *  "descriptionEnglish": "Reading the comments are you, go get a cup of coffee!",
 *  "descriptionSwedish": "Bra applikation som fixar saker.",
 *  "monitorUrl": "https://example.com/my-app/_monitor"
 * }
 *
 */
const _getApplication = (request, response, uriQuery) => {
  https.get(getOptions(uriQuery), api => {
    var responseBody = "";

    // statuskod 404 ska särbehanlads
    api.on("data", function(chunk) {
      responseBody += chunk;
    });

    api.on("end", function() {
      httpResponse.ok(
        request,
        response,
        responseBody,
        httpResponse.contentTypes.JSON
      );
    });

    api.on("error", function(e) {
      httpResponse.notFound(
        request,
        response,
        {
          messsage: "Unable to find any matching deployment for this path."
        },
        httpResponse.contentTypes.JSON
      );
      logger.log.error(
        `Unable to read application information for query '${uriQuery}' from ${options.hostname}`
      );
    });
  });
};

/**
 * Module exports
 */
module.exports = {
  getApplication: _getApplication,
  // Exposed for unit testing.
  _getCluster: _getCluster,
  _applicationsApiHost: _applicationsApiHost,
  _getSearchPath: _getSearchPath
};
