const express = require('express');
const bloomsController = require('../controllers/blooms');
const bloomsRouter = express.Router();

bloomsRouter.get('/addBlooms', (req, res) => {

  res.render('addBlooms');
});
bloomsRouter.get('/update/:bloomId', bloomsController.updateForm);
bloomsRouter.get('/:bloomId', bloomsController.get);
bloomsRouter.post('/', bloomsController.post);
bloomsRouter.put('/:bloomId', bloomsController.put);
bloomsRouter.delete('/:bloomId', bloomsController.del);

module.exports = bloomsRouter;
