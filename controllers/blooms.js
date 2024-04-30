const { getBlooms, createBloom, updateBloom, deleteBloom } = require('../models/blooms');
const { Bloom } = require('../models/blooms');

const bloomsController = {
    getAll: async (req, res) => {
        try {
            const data = await getBlooms(); 
            res.render('blooms', { blooms: data }); 
        } catch(err) {
            console.error(`ERROR GETTING ALL BLOOMS: ${err}`);
            res.status(500).send('Error fetching blooms');
        }
    },
    get: async (req, res) => {
        let data = [];
        const bloomId = req.params?.bloomId;
        console.log(req.params);
        console.log('Bloom id: ', bloomId);
        try {
            data = typeof bloomId == 'string' ? await getBlooms(bloomId) : await getBlooms();
        } catch(err) {
            console.error(`ERROR GETTING BLOOMS IN CONTROLLER: ${err}`);
        }
        if (req.query?.updating) return res.render('updateBloom', { bloom: data[0] });
        return bloomId ? res.render('singleBloom', { bloom: data[0] }) : res.render('blooms', { blooms: data });
    },
    post: async (req, res) => {
        let success = false;
        try {
            console.log('Creating a bloom');
            success = await createBloom(req.body);
        } catch(err) {
            console.error(`ERROR CREATING BLOOM IN CONTROLLER: ${err}`);
        }
        return success ? res.status(200).send('Bloom created') : res.status(500).send('Error creating bloom');
    },
    put: async (req, res) => {
        const { id, image, plantName, description, region, benefits, growingConditions, pricePerSeedPacket, pricePerBareRootPlant } = req.body;

        if (!id) {
            return res.status(400).send('Bloom ID is required');
        }

        try {
            const bloom = await Bloom.findByIdAndUpdate(id, {
                image,
                plantName,
                description,
                region,
                benefits,
                growingConditions,
                pricePerSeedPacket,
                pricePerBareRootPlant
            }, { new: true });

            if (bloom) {
                res.status(200).send('Bloom updated');
            } else {
                res.status(404).send('Bloom not found');
            }
        } catch(err) {
            console.error(`ERROR UPDATING BLOOM: ${err}`);
            res.status(500).send('Error updating bloom');
        }
    },
    updateForm: async (req, res) => {
        try {
            const bloom = await Bloom.findById(req.params.bloomId).lean();
            if (!bloom) {
                return res.status(404).send('Bloom not found');
            }
            res.render('updateBlooms', { bloom });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
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
};

module.exports = bloomsController;
