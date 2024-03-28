const { User } = require('../models/users'); 
const { Bloom } = require('../models/blooms'); 

const dashboardController = {
    get: async (req, res) => {
        const userSession = req.session?.user;
        if (!userSession) {
            return res.redirect('/login');
        }

        try {
            if (userSession.role === 'admin') {
                // Fetch all blooms if the user is an admin
                const blooms = await Bloom.find({}).lean();
                return res.render('dashboard', { user: userSession, isAdmin: true, blooms });
            } else {
                // For a non-admin user
                const userWithWishList = await User.findById(userSession._id)
                                                   .populate('wishList')
                                                   .lean();

                
                req.session.user = { ...userSession, ...userWithWishList };

                // Render the dashboard for a regular user with their wishlist
                return res.render('dashboard', {
                    user: req.session.user,
                    isAdmin: false,
                    blooms: userWithWishList.wishList, 
                });
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            return res.status(500).send('An error occurred');
        }
    }
};

module.exports = dashboardController;
