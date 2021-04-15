const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

//connecting Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
});
//error handling for Mongoose connect
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database connected')
});

//seedHelper random name generator
const sample = array => array[Math.floor(Math.random() * array.length)];

//initializing db
const seedDB = async () => {
    await Campground.deleteMany({}); 
    for(let i = 0; i < 50; i++) { 
        const random1000 = Math.floor(Math.random() * 1000); 
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`, //using sample() to create random descriptors and places
            location: `${cities[random1000].city}, ${cities[random1000].state}`, 
        })
        await camp.save(); 
    }
};

seedDB().then(() => {
    mongoose.connection.close(); //closing database connection after response
})