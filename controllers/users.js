const router = require('express').Router()

const { User } = require('../models')
const { Blog } = require('../models')

const { tokenExtractor } = require('../middleware/middleware')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: [{
      model: Blog,
      attributes: ['id', 'title', 'author', 'url', 'likes']
    },
      {
        model: Team,
        attributes: ['name', 'id'],
                through: {
          attributes: []
        }
      }
    ]
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] } ,
    include:[{
        model: Note,
        attributes: { exclude: ['userId'] }
      },
      {
        model: Note,
        as: 'marked_notes',
        attributes: { exclude: ['userId']},
        through: {
          attributes: []
        },

        include: {
          model: User,
          attributes: ['name']
        }
      },
      {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: []
        }
      },
    ]
  })

  if (!user) {
    return res.status(404).end()
  }

  let teams = undefined
  if (req.query.teams) {
    teams = await user.getTeams({
      attributes: ['name'],
      joinTableAttributes: []  
    })
  }
  res.json({ ...user.toJSON(), teams })
})

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' })
  }
  next()
}

router.put('/:username', tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.disabled = req.body.disabled
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})



module.exports = router