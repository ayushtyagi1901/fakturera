/**
 * Utility functions for sending HTTP responses
 */

/**
 * Send a JSON response
 * @param {http.ServerResponse} res - HTTP response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Data to send as JSON
 * @param {string} contentType - Content type (default: application/json)
 */
export function sendResponse(res, statusCode, data, contentType = 'application/json') {
  res.setHeader('Content-Type', contentType);
  res.writeHead(statusCode);
  const response = contentType === 'application/json' ? JSON.stringify(data) : data;
  res.end(response);
}

/**
 * Send an error response
 * @param {http.ServerResponse} res - HTTP response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {object} additionalData - Additional error data
 */
export function sendError(res, statusCode, error, message, additionalData = {}) {
  const errorResponse = {
    error,
    message,
    ...additionalData
  };
  sendResponse(res, statusCode, errorResponse);
}

