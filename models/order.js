// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        bloomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bloom',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    total: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
