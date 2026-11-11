const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Trust Render reverse proxy in production
if (isProduction) {
    app.set("trust proxy", 1);
}

const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration (Allows GitHub Pages, Render, and Localhost)
const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (
        origin === "https://dharunya28.github.io" ||
        origin.endsWith(".github.io") ||
        origin.endsWith(".onrender.com") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
    ) {
        return true;
    }
    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Log incoming requests in development
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Health check endpoint for Render monitoring
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Task Management API is healthy",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Frontend static files (serves built React Vite frontend in production)
const clientDist = fs.existsSync(path.join(__dirname, "../docs"))
    ? path.join(__dirname, "../docs")
    : path.join(__dirname, "../frontend/dist");

if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));

    app.use((req, res, next) => {
        if (req.method === "GET" && !req.path.startsWith("/api")) {
            return res.sendFile(path.join(clientDist, "index.html"));
        }
        next();
    });
} else {
    // Health check / Base route fallback
    app.get("/", (req, res) => {
        res.json({ message: "Task Management API is running!", status: "healthy" });
    });
}

// Central 404 handler for unmatched API routes
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Global Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});

// Connect MongoDB
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
    console.error(
        "WARNING: MONGODB_URI (or MONGO_URI) is not defined in environment variables! Please check your .env file or Render settings."
    );
} else {
    mongoose
        .connect(mongoURI)
        .then(() => {
            console.log("MongoDB connected successfully!");
        })
        .catch((error) => {
            console.error("MongoDB connection failed:", error.message);
        });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
