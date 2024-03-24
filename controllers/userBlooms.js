const { updateUserBlooms } = require('../models/users') 

const userBloomsController = {
    post: async (req, res) => {
        let success = false
        try {
            const user = req.session?.user
            const bloomId = req.body?.bloomId 
            const isAdding = req.body?.isAdding || false
            if(!user || !bloomId) { 
                return res.render('blooms', { errMessage: 'Please log in to add or remove a bloom.' })
            }

            success = await updateUserBlooms(bloomId, user, isAdding)
            console.log('Updated user obj: ', success)
            if(success) req.session.user = success 
            console.log('Success: ', success)
        } catch(err) {
            console.error(`ERROR UPDATING USER BLOOMS IN CONTROLLER: ${err}`)
        }

        return success ? res.redirect('/blooms') : res.render('blooms', { errMessage: 'Failed to update blooms. Please try again.' })
    }
}

module.exports = userBloomsController;
