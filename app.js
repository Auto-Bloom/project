const express = require('express')
const session = require('express-session');
const handlebars = require('express-handlebars')
const path = require('path')
const { Bloom } = require('./models/blooms');
const { User } = require('./models/users.js');
const Cart = require('./models/cart');



require('dotenv').config()

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Handlebars - html templating setup
app.set('view engine', 'hbs')
app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials'
}))

const hbs = handlebars.create({})
hbs.handlebars.registerHelper('ifEquals', (arg, argTwo) => arg == argTwo)
hbs.handlebars.registerPartial('nav', '{{{nav}}}')
hbs.handlebars.registerPartial('footer', '{{{footer}}}')
hbs.handlebars.registerPartial('blooms', '{{{bloom}}}')

//DB Connection
require('./db/db')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use(express.json())

//Routes
app.use('/', require('./routes'))
const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);
const contactRoutes = require('./routes/contact');
app.use('/contact', contactRoutes);


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
app.post('/blooms', (req, res) => {
  // Ensure that 'region' and 'benefits' are always arrays
  req.body.region = Array.isArray(req.body.region) ? req.body.region : req.body.region ? [req.body.region] : [];
  req.body.benefits = Array.isArray(req.body.benefits) ? req.body.benefits : req.body.benefits ? [req.body.benefits] : [];
  
  const bloom = new Bloom(req.body);
  bloom.save()
      .then((result) => {
          res.redirect('/blooms'); // Redirect to the blooms listing page
      })
      .catch((err) => {
          console.log(err);
          // Handle the error, potentially sending the user back to the form with an error message
      });
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


//Start Server
const port = process.env.PORT || 555
app.listen(port, () => console.log(`Server is running on port ${port}`))
