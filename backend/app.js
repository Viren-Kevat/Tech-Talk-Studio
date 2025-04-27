require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const connectDB = require("./db");
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const studentsRoutes = require("./routes/studentsRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
const commentRoutes = require("./routes/comments"); // Assuming you have a commentRoutes file
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" })); // Increase to 1GB if necessary
// Middleware and configurations
app.use((req, res, next) => {
  // console.log(`Request Content-Length: ${req.headers["content-length"]} bytes`);
  next();
});
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // Allow requests from the frontend
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  })
);
app.use(
  session({
    secret: process.env.JWT_SECRET, // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true, // Prevents XSS attacks
      secure: false, // Set to `true` in production (requires HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Connect to MongoDB
connectDB();

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/comments", commentRoutes); // Assuming you have a commentRoutes file

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
