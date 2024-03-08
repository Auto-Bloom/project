// module.exports = { run, client }
// // env: MONGODB_URI=mongodb+srv://sdev255:group2@sdev255.cr2wps4.mongodb.net/
// // Cass: dr4F5Aic963rqtRQ - cassandra
// // Poulis: ZN7lnY25fdFbAV1K - poulis

const mongoose = require('mongoose')
const uri = process.env.MONGODB_URI

const connection = mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(`Error connecting to MongoDB: ${err}`))

module.exports = connection