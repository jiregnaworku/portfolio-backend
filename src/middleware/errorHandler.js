const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
};

module.exports = { notFound, errorHandler };
