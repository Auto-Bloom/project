const { model, Schema } = require('mongoose');

const bloomSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    plantName: {
        type: String,
        required: true
    },
    region: [{
        type: String,
        required: true,
        enum: ['Northeast', 'Midwest', 'South', 'West']
    }],
    description: {
        type: String,
        required: true
    },
    benefits: [{
        type: String,
        required: true,
        enum: ['attracts pollinators', 'deer resistant']
    }],
    growingConditions: {
        type: String,
        required: true,
        enum: ['full sun', 'partial sun', 'full shade']
    },
    pricePerSeedPacket: {
        type: String,
        required: false 
    },
    pricePerBareRootPlant: {
        type: String,
        required: false // not required anymore
    }
});

bloomSchema.pre('save', function (next) {
    if (!this.pricePerSeedPacket && !this.pricePerBareRootPlant) {
        next(new Error('Either pricePerSeedPacket or pricePerBareRootPlant must be provided.'));
    } else {
        next();
    }
});

// Define the Bloom model
const Bloom = model('Bloom', bloomSchema);

// Functions using the Bloom model
const createBloom = async (data) => {
    const bloom = new Bloom(data);
    try {
        await bloom.save();
        return true; // Return true if save was successful
    } catch (err) {
        console.error(`ERROR SAVING BLOOM: ${err}`);
        throw err; // Throw the error to be caught in the calling function
    }
};

const updateBloom = async (req, res) => {
    const { id, image, plantName, description, region, benefits, growingConditions, pricePerSeedPacket, pricePerBareRootPlant } = req.body;

    console.log('Received prices:', pricePerSeedPacket, pricePerBareRootPlant); // Debugging log

    if (!id) {
        return res.status(400).send('Bloom ID is required');
    }

    try {
        const updatedBloom = await Bloom.findByIdAndUpdate(id, {
            image, plantName, description, region: region.split(','), benefits: benefits.split(','), growingConditions, pricePerSeedPacket, pricePerBareRootPlant
        }, { new: true });

        if (updatedBloom) {
            res.status(200).send('Bloom updated');
        } else {
            res.status(404).send('Bloom not found');
        }
    } catch (err) {
        console.error(`ERROR UPDATING BLOOM: ${err}`);
        res.status(500).send('Error updating bloom');
    }
};



const deleteBloom = async (bloomId) => {
    let success = false;
    if (!bloomId) return success;
    try {
        const result = await Bloom.findByIdAndDelete(bloomId);
        if (result) success = true;
    } catch (err) {
        console.error(`ERROR DELETING BLOOM: ${err}`);
    }
    return success;
};

const getBlooms = async (bloomId = null) => {
    let blooms = [];
    try {
        if (typeof bloomId == 'string') {
            blooms.push(await Bloom.findOne({ _id: bloomId }));
        } else {
            blooms.push(...await Bloom.find());
        }
    } catch (err) {
        console.error(`ERROR GETTING BLOOMS: ${err}`);
    }
    return blooms.length ? blooms.map(bloom => {
        const bloomObj = bloom.toObject();
        bloomObj.link = `/blooms/${bloomObj._id}`;
        bloomObj.registerLink = `/register/${bloomObj._id}`;
        return bloomObj;
    }) : [];
};

module.exports = { Bloom, createBloom, getBlooms, updateBloom, deleteBloom };
