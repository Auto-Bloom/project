const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')
const { Bloom } = require('./models/blooms');
require('dotenv').config()

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

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

//Routes
app.use('/', require('./routes'))

// For creating a new bloom
app.get('/addBlooms', (req, res) => {
  res.render('addBlooms');
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

// Route to display blooms by region, incorporating the .lean() method for efficiency
app.get('/region/:regionName', async (req, res) => {
  const regionName = req.params.regionName;
  
  try {
      // Use the .lean() method to get plain JavaScript objects
      const blooms = await Bloom.find({ region: { $in: [regionName] } }).lean();
      // Render the 'bloomsByRegion' view, passing it the blooms and the regionName
      res.render('bloomsByRegion', { blooms, regionName });
  } catch (err) {
      console.error(`Error fetching blooms for region ${regionName}: ${err}`);
      res.status(500).send('Error fetching blooms for the specified region');
  }
});



//Start Server
const port = process.env.PORT || 555
app.listen(port, () => console.log(`Server is running on port ${port}`))
