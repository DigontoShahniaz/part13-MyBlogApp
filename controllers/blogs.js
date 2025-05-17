const router = require('express').Router()
const { Blog } = require('../models')
const { User } = require('../models')

const { Op } = require('sequelize')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    const searchTerm = `%${req.query.search}%`
    where[Op.or] = [
      { title: { [Op.iLike]: searchTerm } },
      { author: { [Op.iLike]: searchTerm } }
    ]
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['id', 'name', 'username']
    },
    where,
    order: [['likes', 'DESC']]
  })

  res.json(blogs)
})


router.get('/:id', blogFinder, (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.put('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    if (req.body.likes !== undefined) {
      req.blog.likes = req.body.likes
    }
    await req.blog.save()
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  if (!req.blog) {
    return res.status(404).json({ error: 'Blog not found' })
  }

  if (req.blog.userId !== req.decodedToken.id) {
    return res.status(403).json({ error: 'You are not allowed to delete this blog' })
  }

  await req.blog.destroy()
  res.status(204).end()
})



router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

module.exports = router
