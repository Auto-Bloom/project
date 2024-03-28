const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact');

router.get('/', (req, res) => {
    res.render('contact');
});

//form submission
router.post('/api/contact', contactController.createContact);

module.exports = router;
