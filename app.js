const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const Campground = require('./models/campground');

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

//express ejs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('home')
});

//index of all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({}); //grab all campgrounds from DB
    res.render('campgrounds/index', { campgrounds }) //pass this into our ejs template.
});

//show route of campground details
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; //saving id 
    const campground = await Campground.findById(id) //searching for campground
    res.render('campgrounds/show', { campground }); //passing to template
})

//setting up server
app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
});