const { getBlooms, createBloom, updateBloom, deleteBloom } = require('../models/blooms')

const bloomsController = {
    get: async (req, res) => {
        let data = []
        const bloomId = req.params?.bloomId
        console.log(req.params)
        console.log('Bloom id: ', bloomId)
        try {
            data = typeof bloomId == 'string' ? await getBlooms(bloomId) : await getBlooms()
        } catch(err) {
            console.error(`ERROR GETTING BLOOMS IN CONTROLLER: ${err}`)
        }
        if(req.query?.updating) return res.render('updateBloom', { bloom: data[0] })
        return bloomId ? res.render('singleBloom', { bloom: data[0] }) : res.render('blooms', { blooms: data })
    },
    post: async (req, res) => {
        let success = false;
        try {
            console.log('Creating a bloom')
            success = await createBloom(req.body);
        } catch(err) {
            console.error(`ERROR CREATING BLOOM IN CONTROLLER: ${err}`)
        }
        return success ? res.status(200).send('Bloom created') : res.status(500).send('Error creating bloom');
    },
    put: async (req, res) => {
        let success = false
        try {
            success = await updateBloom(req.body)
        } catch(err) {
            console.error(`ERROR UPDATING BLOOM IN CONTROLLER: ${err}`)
        }
        return success ? res.status(200).send('Bloom updated') : res.status(500).send('Error updating bloom');
    },
    del: async (req, res) => {
        let success = false;
        try {
            success = await deleteBloom(req.params.bloomId);
        } catch(err) {
            console.error(`ERROR DELETING BLOOM IN CONTROLLER: ${err}`);
        }
        return success ? res.status(200).send('Bloom deleted') : res.status(500).send('Error deleting bloom');
    }
}

module.exports = bloomsController;
