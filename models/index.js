const Blog = require('./blog')
const User = require('./user')
const Team = require('./team')
const Membership = require('./membership')
const UserBlogs = require('./user_blogs')

User.hasMany(Blog)
Blog.belongsTo(User)

Blog.sync({ alter: true })
User.sync({ alter: true })
User.belongsToMany(Team, { through: Membership })
Team.belongsToMany(User, { through: Membership })

User.belongsToMany(Blog, { through: UserNotes, as: 'marked_blogs' })
Blog.belongsToMany(User, { through: UserNotes, as: 'users_marked' })

module.exports = {
  Blog, User, Team, Membership
}