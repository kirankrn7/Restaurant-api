const mongoose = require("mongoose");
const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number
    },
    priceRange: {
        type: String
    },
    open: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("Restaurant", restaurantSchema);