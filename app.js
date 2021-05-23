const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
//JOI validation file
const { campgroundSchema, reviewSchema } = require('./schemas.js');

//routes files
const campgrounds = require('./routes/campgrounds');

const Campground = require('./models/campground');
const Review = require('./models/review');
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

//JOI Validator Middleware for Reviews
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(','); //map over the error array
        throw new ExpressError(msg, 400); 
    } else {
        next();
    }
}

//routes
app.use('/campgrounds', campgrounds);

app.get('/', (req, res) => {
    res.render('home')
});

//review form submit
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review); //review[rating]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}))

//delete a review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) 
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`); 
}))

//bad request handler
app.all('*', (req, res, next) => { //listening to all routes
    next(new ExpressError('Page Not Found', 404)); //using Express Error message + statusCode
});

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong...';
    res.status(statusCode).render('error', { err }); // passes entire err object 
})

//setting up server
app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000')
});