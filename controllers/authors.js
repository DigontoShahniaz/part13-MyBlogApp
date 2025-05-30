const router = require('express').Router()

const { sequelize } = require('../util/db')
const { Blog } = require('../models')

router.get('/authors', async (req, res) => {
  const authors = await Blog.findAll({
    attributes: [
      'author',
      [sequelize.fn('COUNT', sequelize.col('id')), 'articles'],
      [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
    ],
    group: ['author'],
    order: [[sequelize.fn('SUM', sequelize.col('likes')), 'DESC']]
  })

  res.json(authors)
})


module.exports = router