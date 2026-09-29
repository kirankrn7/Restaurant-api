const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurant");
require("dotenv").config();

const app = express();

app.use(express.json());

app.post("/restaurants", async (req, res) => {
    try {
        const restaurant = new Restaurant(req.body);
        await restaurant.save();
        res.status(201).send(restaurant);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).send(restaurants);
    } catch (error) {
        res.status(500).send(error);
    }
}
);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    }
);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

