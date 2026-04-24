const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — resource already exists.' });
  }
  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
};

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };