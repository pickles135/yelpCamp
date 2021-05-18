const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut for referencing Schema

const CampgroundSchema = new Schema({
    title: String, 
    image: String,
    price: Number, 
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Review' //review model
        }
    ]
});

//Removing reviews in campground after deletion
//Middleware
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({ 
            _id: {
                $in: doc.reviews //deleting reviews where ID is in our document.
            }
        })
    }
})

//compile + export
module.exports = mongoose.model('Campground', CampgroundSchema);