const errorHandler = (err, req, res, next) => {
  console.error(err.name, err.message)

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors.map(e => e.message) })
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: 'Database error', details: err.message })
  }

  return res.status(500).json({ error: 'Internal server error' })
}

module.exports = errorHandler
