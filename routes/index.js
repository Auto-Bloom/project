const router = require('express').Router()

router.get('/', (req, res) => res.render('index'))
router.get('/add-course', (req, res) => res.render('addCourse'))
router.use('/blooms', require('./blooms'))
router.use('/login', require('./login'))
router.use('/register', require('./register'))
router.use('/dashboard', require('./dashboard'))

module.exports = router