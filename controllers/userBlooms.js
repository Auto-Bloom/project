const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { updateUserBlooms: updateUserBloomsModel } = require('../models/users');
const { User } = require('../models/users');

const userBloomsController = {
    post: async (req, res) => {
        let success = false;
        try {
            const user = req.session?.user;
            const bloomId = req.body?.bloomId;
            const isAdding = req.body?.isAdding || false;
            if (!user || !bloomId) {
                return res.render('blooms', { errMessage: 'Please log in to add or remove a bloom.' });
            }

            success = await updateUserBlooms(bloomId, user, isAdding);
            console.log('Updated user obj: ', success);
            if (success) req.session.user = success;
            console.log('Success: ', success);
        } catch (err) {
            console.error(`ERROR UPDATING USER BLOOMS IN CONTROLLER: ${err}`);
        }

        return success ? res.redirect('/blooms') : res.render('blooms', { errMessage: 'Failed to update blooms. Please try again.' });
    },
    removeFromWishlist: async (req, res) => {
        const { bloomId } = req.params;
        const user = req.session?.user;
        if (!user || !bloomId) {
            return res.status(400).send('Session expired or invalid bloom.');
        }

        try {
            const success = await updateUserBlooms(bloomId, user, false); // Assuming false means remove
            if (success) {
                res.status(200).send('Bloom removed successfully');
            } else {
                res.status(500).send('Failed to remove bloom from wishlist');
            }
        } catch (err) {
            console.error(`ERROR: ${err}`);
            res.status(500).send('Server error while removing bloom from wishlist');
        }
    }
};

module.exports = userBloomsController;

const updateUserBlooms = async (bloomId, userSession, isAdding) => {
    const user = await User.findById(userSession._id);
    if (!user) {
        console.error('User not found');
        return null;
    }

    // Correcting ObjectId instantiation
    bloomId = new ObjectId(bloomId); 

    try {
        if (isAdding) {
            if (!user.wishList.map(id => id.toString()).includes(bloomId.toString())) {
                user.wishList.push(bloomId);
            }
        } else {
            const index = user.wishList.findIndex(id => id.toString() === bloomId.toString());
            if (index > -1) {
                user.wishList.splice(index, 1);
            }
        }
        await user.save();
        return user;
    } catch (err) {
        console.error('Error updating user blooms:', err);
        return null;
    }
};
