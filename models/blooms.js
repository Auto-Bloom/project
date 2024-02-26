const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bloomSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true // image URLs. If storing images directly use a buffer type
    },
    regions: [{
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    useBenefit: {
        type: String,
        required: true
    },
    growingConditions: {
        type: String,
        required: true
    },
});

const Bloom = mongoose.model('Bloom', bloomSchema);
module.exports = Bloom;
