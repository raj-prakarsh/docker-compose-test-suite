"use strict";

const logger = require("./logger");

const contentTypes = {
  PLAIN_TEXT: "text/plain",
  HTML: "text/html",
  JSON: "application/json"
};

const statusCodes = {
  OK: 200,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 501
};

/**
 * Send status 200 with a body set to the content type.
 * Default content type is text/html.
 */
let _ok = function ok(
  request,
  response,
  body,
  contentType = contentTypes.HTML
) {
  logger.log.debug("Using contentType: " + contentType);
  _send(request, response, body, statusCodes.OK, contentType);
};

/**
 * Send status 404 with a body set to the content type.
 * Default content type is text/html.
 */
let _notFound = function notFound(
  request,
  response,
  body,
  contentType = contentTypes.HTML
) {
  _send(request, response, body, statusCodes.NOT_FOUND, contentType);
};

let _noContent = function noContent(request, response) {
  _send(request, response, "", statusCodes.NO_CONTENT, contentTypes.PLAIN_TEXT);
};

/**
 * Send status internal server error with a body set to the content type.
 * Default content type is text/html.
 */
let _internalServerError = function internalServerError(
  request,
  response,
  body,
  contentType = contentTypes.HTML
) {
  _send(
    request,
    response,
    body,
    statusCodes.INTERNAL_SERVER_ERROR,
    contentType
  );
};

/**
 * Send the content type with the passed status code.
 * Default content type is text/html.
 * Default status code is 200.
 */
let _send = function send(
  request,
  response,
  bodyContent,
  statusCode = statusCodes.OK,
  contentType = contentTypes.HTML
) {
  logger.logRequest(request, statusCode, _getClientIp(request));
  response.set("X-Frame-Options", "sameorigin");
  response.set("Content-Type", contentType);
  response.status(statusCode).send(bodyContent);
};

/**
 * Gets out the requestors IP.
 * The IP is found on differnt places depending on
 * if the service is accessed directly or via proxy.
 */
let _getClientIp = function getClientIp(request) {
  let result = request.headers["x-forwarded-for"];

  if (result == null) {
    if (request.connection && request.connection.remoteAddress) {
      result = request.connection.remoteAddress;
    }
  }

  if (result == null) {
    result = request.ip;
  }

  if (result == null) {
    result = "missing remote ip";
  }

  return result;
};

/**
 * Module exports
 */
module.exports = {
  ok: _ok,
  notFound: _notFound,
  noContent: _noContent,
  internalServerError: _internalServerError,
  statusCodes: statusCodes,
  contentTypes: contentTypes
};
