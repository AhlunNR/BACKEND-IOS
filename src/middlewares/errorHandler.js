/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorHandler;
