require('dotenv').config();

const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
app.set('views', path.join(__dirname, 'views'));

const Bloom = require('./models/blooms'); // Ensure this matches the actual file path

// Connect to MongoDB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // Listen after successful connection to DB
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => console.log(err));

// Set Handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('home');
  });
  
  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.get('/add-data', (req, res) => {
    res.render('add-data');
  });
  
  app.get('/bloom-index', (req, res) => {
    res.render('bloom-index');
  });
  
  app.get('/clickmap', (req, res) => {
    res.render('clickmap');
  });
  

 // Click map
 app.get('/blooms/region/:regionName', (req, res) => {
    Bloom.find({ regions: req.params.regionName })
        .then(blooms => res.json(blooms))
        .catch(err => res.status(500).send('Error fetching blooms for region'));
});

// regions
app.get('/region/:regionName', (req, res) => {
    const regionName = req.params.regionName;
    // Logic to retrieve and send back the specific region's webpage
    res.render('regionPage', { regionName: regionName });
});

// Adding a Bloom
app.post('/add-bloom', (req, res) => {
    const { title, image, regions, description, useBenefit, growingConditions } = req.body;
    const bloom = new Bloom({
        title,
        image,
        regions: regions.split(','), // Assuming regions are submitted as a comma-separated string
        description,
        useBenefit,
        growingConditions
    });
    bloom.save()
        .then(result => res.send('Bloom added successfully'))
        .catch(err => console.log(err));
});

// bloom-index

app.get('/bloom-index', (req, res) => {
    Bloom.find()
        .then(blooms => {
            // Render the 'bloom-index' template with the fetched blooms
            res.render('bloom-index', { blooms });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching blooms');
        });
});


// indivdual blooms
app.get('/blooms/:id', (req, res) => {
    Bloom.findById(req.params.id)
        .then(bloom => {
            if (bloom) {
                res.json(bloom);
            } else {
                res.status(404).send('Bloom not found');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching Bloom');
        });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Somethings broken!');
});