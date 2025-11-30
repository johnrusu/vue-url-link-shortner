const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins in development, specify your frontend URL in production
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import database initialization
const { initializeDatabase } = require("./server/database/index.js");

// Initialize database
let dbInitialized = false;

const ensureDbConnection = async () => {
  if (!dbInitialized) {
    console.log(
      "Initializing database with MONGO_URI:",
      process.env.MONGO_URI ? "Set" : "Not set"
    );
    await initializeDatabase();
    dbInitialized = true;
    console.log("Database connected successfully");
  }
};

// Import routes
const routes = require("./server/routes/index.js");

// Wrap routes with database initialization
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use(routes);

// Export the Express app as a Firebase Function with public access
exports.api = functions.https.onRequest(
  {
    cors: true,
    invoker: "public",
  },
  app
);
