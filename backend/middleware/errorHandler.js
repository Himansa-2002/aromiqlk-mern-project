export const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;

    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  if (error.code === 11000) {
    statusCode = 409;

    const duplicateField = Object.keys(
      error.keyValue || {}
    )[0];

    message = duplicateField
      ? `${duplicateField} already exists`
      : 'Duplicate value entered';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
};