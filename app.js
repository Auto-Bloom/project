const express = require('express')
const session = require('express-session');
const handlebars = require('express-handlebars')
const path = require('path')
const { Bloom } = require('./models/blooms');
const { User } = require('./models/users.js');


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


//Start Server
const port = process.env.PORT || 555
app.listen(port, () => console.log(`Server is running on port ${port}`))
