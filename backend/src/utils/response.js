export function sendResponse(res, statusCode, data, contentType = 'application/json') {
  res.setHeader('Content-Type', contentType);
  res.writeHead(statusCode);
  const response = contentType === 'application/json' ? JSON.stringify(data) : data;
  res.end(response);
}

export function sendError(res, statusCode, error, message, additionalData = {}) {
  const errorResponse = {
    error,
    message,
    ...additionalData
  };
  sendResponse(res, statusCode, errorResponse);
}

