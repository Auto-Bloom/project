const { get, post } = require('../controllers/login')
const loginRouter = require('express').Router()

loginRouter
    .get('/', get)
    .post('/', post)

module.exports = loginRouter