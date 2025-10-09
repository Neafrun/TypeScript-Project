const { randomUUID } = require('crypto');

function requestId(req, res, next) {
  const existingId = req.headers['x-request-id'];
  const id = existingId || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

function requestLogger(req, res, next) {
  const start = Date.now();
  const id = req.id || '-';
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${id}] ${method} ${originalUrl} ${status} ${durationMs}ms`);
  });

  next();
}

module.exports = { requestId, requestLogger };


