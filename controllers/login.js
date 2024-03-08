const login = require('../models/login')

const loginController = {
    get: async (req, res) => {
        console.log('Login route get')
        res.render('login')
    },
    post: async (req, res) => {
        
    }
}

module.exports = loginController