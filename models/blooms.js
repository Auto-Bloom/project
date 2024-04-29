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
        required: false // not required anymore
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

const updateBloom = async (data) => {
    let success = false;
    try {
        const {
            id = null,
            image = null,
            plantName = null,
            region = null,
            description = null,
            benefits = null,
            growingConditions = null,
            pricePerSeedPacket, 
            pricePerBareRootPlant
        } = data;
        if (!id || ![pricePerSeedPacket, pricePerBareRootPlant].some(price => price)) {
            console.log('Missing required data in updateBloom');
            return success;
        }
        const updateReq = await Bloom.findByIdAndUpdate(
            { _id: id },
            { image, plantName, region, description, benefits, growingConditions, pricePerSeedPacket },
            { new: true }
        );
        if (updateReq) success = true;
    } catch (err) {
        console.error(`Error updating bloom: ${err}`);
    }
    return success;
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
