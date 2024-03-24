const { getUser } = require('../models/users');
const { Bloom } = require('../models/blooms'); // Import the Bloom model

const dashboardController = {
    get: async (req, res) => {
        const user = req.session?.user;
        if (!user) {
            return res.redirect('/login');
        }

        // Fetch all blooms if the user is an admin
        if (user.role === 'admin') {
            try {
                const blooms = await Bloom.find({}).lean();
                return res.render('dashboard', { user, isAdmin: true, blooms });
            } catch (error) {
                console.error('Error fetching blooms: ', error);
                return res.status(500).send('Error fetching blooms');
            }
        }

        // If not an admin, just render the user's dashboard
        // Fetch user's blooms or other relevant data
        const newUser = await getUser(null, user.email);
        req.session.user.blooms = newUser.blooms;
        return res.render('dashboard', { user, isAdmin: false });
    }
};

module.exports = dashboardController;
