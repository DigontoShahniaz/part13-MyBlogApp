const router = require('express').Router()

router.delete('/logout', sessionValidator, async (req, res) => {
  await Session.destroy({ where: { token: req.token } })
  res.status(204).end()
})
