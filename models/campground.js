const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut for referencing Schema

const CampgroundSchema = new Schema({
    title: String, 
    price: String, 
    description: String, 
    location: String,
});

//compile + export
module.exports = mongoose.model('Campground', CampgroundSchema);