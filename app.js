const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

//routes files
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

//utils files
const ExpressError = require('./utils/ExpressError');

//connecting Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
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
//serving our public directory
app.use(express.static(path.join(__dirname, 'public')))
//session
const sessionConfig = {
    secret: 'pineapple-express',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //converting to milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
//flash
app.use(flash());

//flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error') //any flash error messages
    next();
})

//routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home')
});


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