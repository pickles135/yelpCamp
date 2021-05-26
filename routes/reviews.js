const express = require('express');
const router = express.Router({ mergeParams: true });
//utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
//model
const Campground = require('../models/campground');
const Review = require('../models/review');
//JOI validation file
const { reviewSchema } = require('../schemas.js');

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

//review form submit
router.post('/', validateReview, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review); //review[rating]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${id}`);
}))

//delete a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review successfully deleted.')
    res.redirect(`/campgrounds/${id}`); 
}))

module.exports = router;