const router = require('express').Router()
const { get, post } = require('../controllers/register')

router.get('/', get)

module.exports = router