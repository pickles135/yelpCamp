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

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
});

app.get('/', (req, res) => {
    res.render('home')
});

//testing Model Schema
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ 
        title: 'My Backyard',
        description: 'Ultra cheap and free camping.'
    })
    await camp.save();
    res.send(camp);
})
