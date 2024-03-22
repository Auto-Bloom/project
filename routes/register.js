const { get, post } = require('../controllers/register')

const registerRouter = require('express').Router()

registerRouter.get('/', get)
registerRouter.post('/', post)

module.exports = registerRouter