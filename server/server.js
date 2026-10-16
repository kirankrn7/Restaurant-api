const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurant");
const { execFile } = require("child_process");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const { authenticateToken, requireAdmin } = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters."
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Email is already registered."
      });
    }

    console.error(error.message);
    res.status(500).json({
      error: "Registration failed."
    });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "JWT secret is not configured."
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Login failed."
    });
  }
});


app.post("/restaurants", authenticateToken, requireAdmin, async (req, res) => {
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
  console.error("Login error:", error.message);
  res.status(500).json({ error: "Login failed." });
}
});

app.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(400).json({ error: "Invalid restaurant ID" });
  }
});

app.put("/restaurants/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(400).json({ error: "Unable to update restaurant" });
  }
});

app.delete("/restaurants/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid restaurant ID" });
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
    "C:\\Users\\Dell\\.local\\bin\\uv.exe",
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
        message: "Quantum analysis complete successfully",
        output: stdout.trim() });
    }
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
