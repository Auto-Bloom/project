const dashboardRouter = require('express').Router()

dashboardRouter.get('/', (req, res) => res.render('dashboard'))

module.exports = dashboardRouter