const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');  // Ensure correct path to the Cart model

// Route to display the user's cart
router.get('/cart', async (req, res) => {
    if (!req.session.user) {
        // If the user is not logged in, redirect them to the login page
        return res.redirect('/login');
    }

    try {
        const userId = req.session.user._id;  // Assuming user ID is stored in the session upon login
        // Fetch the cart for the logged-in user and populate the bloom details
        const cart = await Cart.findOne({ userId }).populate('items.bloomId');

        if (!cart || cart.items.length === 0) {
            // If no cart found or cart is empty, render a message or an empty cart page
            res.render('cart', { user: req.session.user, message: 'Your cart is empty!' });
        } else {
            // If cart is found, pass the cart items to the template for rendering
            res.render('cart', { user: req.session.user, items: cart.items });
        }
    } catch (error) {
        console.error('Failed to retrieve cart:', error);
        res.status(500).send('Error retrieving cart');
    }
});

module.exports = router;
