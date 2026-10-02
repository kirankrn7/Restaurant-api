const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurant");
const { execFile } = require("child_process");
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
});

const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
} else {
  console.warn("MONGODB_URI is not set. Please add it to your .env file.");
}

app.get("/quantum-analysis", (req, res) => {
  execFile(
    "C:\\Users\\Dell\\.local\\bin\\uv.exe",,
    ["run", "python", "quantum_test.py"],
    {
      cwd: "C:\\Users\\Dell\\Downloads\\quantum-restaurant",
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error("Python error:", stderr);
        console.error("stderr:", stderr);

        return res.status(500).json({
          error: "Quantum analysis failed",
          details: stderr,
          message: error.message,
        });
      }

      res.status(200).json({ 
        message: "Quantum analysis completed successfully",
        output: stdout.trim() });
    }
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
