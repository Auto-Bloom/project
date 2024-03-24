const { getUser } = require('../models/user')

const dashboardController = {
    get: async (req, res) => {
        const user = req.session?.user
        if(!user) {
            return res.redirect('/login')
        } else {
            const newUser = await getUser(null, user.email)
            req.session.user.blooms = newUser.blooms
            res.render('dashboard', { user, isAdmin: user.role === 'admin' })
        }
    }
}

module.exports = dashboardController;
