const express = require('express');
const session = require('express-session');
const path = require('path');
const { Bloom } = require('./models/blooms');
const { User } = require('./models/users');
const Cart = require('./models/cart');
const Order = require('./models/order');
const { createBloom } = require('./models/blooms');
const handlebars = require('express-handlebars');

require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname, 'public'))); //static middleware
app.use(express.urlencoded({ extended: true })); //URL encoded middleware
app.use(express.json()); //JSON middleware

const hbs = handlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: {
        contains: function (array, value) {
            return array.includes(value);
        },
        eq: function (v1, v2) {
            return v1 === v2; 
        },
        joinValues: function (values, separator = ', ') {
            return values.join(separator);
        }
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

//DB Connection
require('./db/db')
//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

//Routes
app.use('/', require('./routes'))
const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);
const contactRoutes = require('./routes/contact');
app.use('/contact', contactRoutes)

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Authenticate user
  const user = await User.findOne({ username, password });
  if (user) {
      req.session.user = user;
      // Initialize cart in session
      let cart = await Cart.findOne({ userId: user._id });
      req.session.cart = cart ? cart : { items: [], total: 0 };
      res.redirect('/dashboard');
  } else {
      res.status(401).send('Authentication failed');
  }
});


// For creating a new bloom
app.get('/addBlooms', (req, res) => {
  // admin access
  if (req.session.user && req.session.user.role === 'admin') {
    res.render('addBlooms');
  } else {
    res.redirect('/login');
  }
});
//logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/'); // Redirect
  });
});

//update

app.put('/blooms', async (req, res) => {
  console.log(req.body); 

  const { id, image, plantName, description, region, benefits, growingConditions, pricePerSeedPacket, pricePerBareRootPlant } = req.body;

  if (!id) {
      return res.status(400).send('Bloom ID is required');
  }

  try {
      const updatedBloom = await Bloom.findByIdAndUpdate(id, {
          image, plantName, description, region: region.split(','), benefits: benefits.split(','), growingConditions, pricePerSeedPacket, pricePerBareRootPlant
      }, { new: true });

      if (updatedBloom) {
          console.log('Updated Bloom:', updatedBloom);
          res.status(200).send('Bloom updated');
      } else {
          res.status(404).send('Bloom not found');
      }
  } catch (err) {
      console.error(`ERROR UPDATING BLOOM: ${err}`);
      res.status(500).send('Error updating bloom');
  }
});





// For deleting a bloom
app.delete('/blooms/:id', (req, res) => {
  const id = req.params.id;
  
  Bloom.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/blooms' }); // Adjust the redirect path
    })
    .catch(err => {
      console.log(err);
    });
});
// updating bloom
app.put('/blooms', async (req, res) => {
    const { id, image, plantName, description, region, benefits, growingConditions } = req.body;

    if (!id) {
        return res.status(400).send('Bloom ID is required');
    }

    try {
        const updatedBloom = await Bloom.findByIdAndUpdate(id, {
            image, plantName, description, region: region.split(','), benefits: benefits.split(','), growingConditions
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
});


// Route to display blooms by region
app.get('/region/:regionName', async (req, res) => {
  const regionName = req.params.regionName;
  
  try {
      // Use the .lean() method to get plain JavaScript objects
      const blooms = await Bloom.find({ region: { $in: [regionName] } }).lean();
      res.render('bloomsByRegion', { blooms, regionName });
  } catch (err) {
      console.error(`Error fetching blooms for region ${regionName}: ${err}`);
      res.status(500).send('Error fetching blooms for the specified region');
  }
});
// wishlist
app.put('/dashboard/addToWishList/:bloomId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'user') {
    try {
      //find a user by ID
      const user = await User.findById(req.session.user._id);
      if (!user.wishList.includes(req.params.bloomId)) {
        user.wishList.push(req.params.bloomId);
        await user.save();
        res.send({ message: 'Bloom added to your wish list!' });
      } else {
        res.send({ message: 'This bloom is already in your wish list.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'An error occurred.' });
    }
  } else {
    res.status(403).send({ message: 'Unauthorized' });
  }
});

// POST endpoint for adding to the cart
app.get('/cart', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).redirect('/login');
  }

  try {
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ userId }).populate('items.bloomId');

    if (!cart || cart.items.length === 0) {
      res.render('cart', { cart: null, message: 'Your cart is empty!' });
    } else {
      //Handlebars access issues
      const items = cart.items.map(item => ({
        ...item._doc,
        bloomId: item.bloomId ? { ...item.bloomId._doc } : undefined
      }));

      res.render('cart', { cart: items, user: req.session.user });
    }
  } catch (error) {
    console.error('Failed to retrieve cart:', error);
    res.status(500).send('Error retrieving cart');
  }
});

app.post('/cart/add/:bloomId', async (req, res) => {
  if (!req.session.user) {
    console.log('Unauthorized attempt to access cart');
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const { bloomId } = req.params;
  const userId = req.session.user._id;
  console.log(`Adding bloom ${bloomId} to user ${userId}'s cart`);

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log('No cart found, creating a new one');
      cart = new Cart({ userId, items: [{ bloomId, quantity: 1 }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.bloomId.toString() === bloomId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
        console.log('Item already in cart, increasing quantity');
      } else {
        cart.items.push({ bloomId, quantity: 1 });
        console.log('Adding new item to cart');
      }
    }
    await cart.save();
    console.log('Cart updated successfully');
    res.send({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).send({ success: false, message: 'Failed to add item to cart', error: error.toString() });
  }
});

app.get('/cart', async (req, res) => {
  if (!req.session.user) {
      return res.status(401).redirect('/login');
  }

  try {
      const userId = req.session.user._id;
      const cart = await Cart.findOne({ userId }).populate('items.bloomId');
      if (!cart) {
          res.render('cart', { cart: null, message: 'Your cart is empty!' });
      } else {
          res.render('cart', { cart: cart.items, user: req.session.user });
      }
  } catch (error) {
      console.error('Failed to retrieve cart:', error);
      res.status(500).send('Error retrieving cart');
  }
});

// POST endpoint for removing from the cart
app.post('/cart/remove/:bloomId', async (req, res) => {
  if (!req.session.user) {
      return res.status(401).send({ message: 'Unauthorized' });
  }
  try {
      const userId = req.session.user._id;
      const { bloomId } = req.params;
      let cart = await Cart.findOne({ userId });

      if (cart) {
          const itemIndex = cart.items.findIndex(item => item.bloomId.toString() === bloomId);
          if (itemIndex > -1) {
              cart.items.splice(itemIndex, 1); // remove item from array
              await cart.save();
              res.send({ success: true, message: 'Item removed from cart' });
          } else {
              res.send({ success: false, message: 'Item not found in cart' });
          }
      } else {
          res.send({ success: false, message: 'No cart found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: 'Failed to remove item from cart' });
  }
});

app.post('/order/submit', async (req, res) => {

  const { fullName, email, address, cardNumber, expDate, cvv } = req.body;

  // Simulate payment processing
  const paymentResult = { success: true, transactionId: '1234567890' };

  if (paymentResult.success) {
      // Create a new order in the database
      const order = new Order({
          userId: req.session.user._id,
          items: req.session.cart.items,  // Assuming cart items are stored in session
          total: req.session.cart.total,  // Calculate total or retrieve from session
          address: address,
          paymentStatus: 'Completed'
      });

      try {
          await order.save();
          res.json({ success: true, message: 'Order placed successfully', orderId: order._id });
      } catch (error) {
          console.error('Order saving error:', error);
          res.status(500).json({ success: false, message: 'Failed to place order' });
      }
  } else {
      res.status(400).json({ success: false, message: 'Payment failed' });
  }
});
// Route for the checkout page
app.get('/checkout', (req, res) => {
  if (!req.session.user) {
      console.log('Redirect to Login: No user session found.');
      return res.redirect('/login');
  }

  if (!req.session.cart || req.session.cart.items.length === 0) {
      console.log('Redirect to Cart: Cart is empty or not found.');
      return res.redirect('/cart');
  }

  try {
      res.render('checkout', {
          user: req.session.user,
          cart: req.session.cart
      });
  } catch (error) {
      console.error('Error rendering checkout:', error);
      res.status(500).send('Error processing your request');
  }
});



//Start Server
const port = process.env.PORT || 555
app.listen(port, () => console.log(`Server is running on port ${port}`))