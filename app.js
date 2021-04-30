const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
//utils files
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

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
app.engine('ejs', ejsMate); //Express to use ejs
app.set('view engine', 'ejs');

//middleware express parser
app.use(express.urlencoded({ extended: true }));
//method override for PUT and PATCH
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
});

//index of all campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); //grab all campgrounds from DB
    res.render('campgrounds/index', { campgrounds }) //pass this into our ejs template.
}));

//creating form for new campground.
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new') //creating template called new
});

//posting form data
app.post('/campgrounds', catchAsync(async (req, res, next) => {
        if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); //client error
        const campground = new Campground(req.body.campground); 
        await campground.save(); 
        res.redirect(`/campgrounds/${campground._id}`); 
}))

//show route of campground details
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params; //saving id 
    const campground = await Campground.findById(id) //searching for campground
    res.render('campgrounds/show', { campground }); //passing to template
}));

//form to edit campground instance
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;  
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground }); 
}));

//submitting the Edit Form
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spreading the entire campground
    res.redirect(`/campgrounds/${campground._id}`);
}));

//deleting specific campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id);
     res.redirect('/campgrounds');
}))

//bad request handler
app.all('*', (req, res, next) => { //listening to all routes
    next(new ExpressError('Page Not Found', 404)); //using Express Error message + statusCode
});

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error'); //render template
})

//setting up server
app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
});