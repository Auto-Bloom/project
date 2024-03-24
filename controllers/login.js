const { getUser, deleteAllUsers } = require('../models/users'),
      bcrypt = require('bcrypt')

const loginController = {
    get: (req, res) => res.render('login'),
    post: async (req, res) => {
        console.log('Logging in: ', req.body)
        const { email = null, password = null } = req.body
        if(!email || !password) {
            return res.render('login', { errMessage: 'Please provide a username and password to login.' })
        }
        const user = await getUser(null, email)
        if(!user || !bcrypt.compareSync(password, user.password)) {
            return res.render('login', { errMessage: 'Invalid username or password' })
        }
        console.log('Successfully logged in user: ', user)
        req.session.user = user
        res.redirect('/dashboard')
    }
}

module.exports = loginController