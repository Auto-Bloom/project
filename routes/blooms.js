// Change the require statement to import the whole controller object
const bloomsController = require('../controllers/blooms');
const bloomsRouter = require('express').Router();

// Use the controller's methods when defining routes
bloomsRouter.get('/:bloomId?', bloomsController.get);
bloomsRouter.post('/', bloomsController.post);
bloomsRouter.put('/:bloomId', bloomsController.put);
bloomsRouter.delete('/:bloomId', bloomsController.del);

module.exports = bloomsRouter;

