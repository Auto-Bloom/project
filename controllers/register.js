const { createUser, deleteAllUsers } = require('../models/users')

const registerController = {
    get: (req, res) => res.render('register'),
    post: async (req, res) => {
        console.log('Registering user: ', req.body)
        const createUserReq = await createUser(req.body)
        const { errMessage = null } = createUserReq
        if(!errMessage) return res.redirect('login')
        res.render('register', { errMessage })
    }
}

module.exports = registerController