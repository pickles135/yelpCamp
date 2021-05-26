const express = require('express');
const router = express.Router();
//error handlers
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
//campground models
const Campground = require('../models/campground');
//schema
const { campgroundSchema } = require('../schemas.js');

//JOI Validator Middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //destructure error
    if(error) {
        const msg = error.details.map(el => el.message).join(','); //map over the error array
        throw new ExpressError(msg, 400); 
    } else {
        next();
    }
}

//index of all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); //grab all campgrounds from DB
    res.render('campgrounds/index', { campgrounds }) //pass this into our ejs template.
}));

//creating form for new campground.
router.get('/new', (req, res) => {
    res.render('campgrounds/new') //creating template called new
});

//posting form data
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); 
    await campground.save(); 
    req.flash('success', 'Successfully created a new campground.')
    res.redirect(`/campgrounds/${campground._id}`); 
}))

//show route of campground details
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params; 
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground }); 
}));

//form to edit campground instance
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;  
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground }); 
}));

//submitting the Edit Form
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spreading the entire campground
    res.redirect(`/campgrounds/${campground._id}`);
}));

//deleting specific campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id);
     res.redirect('/campgrounds');
}))

module.exports = router;