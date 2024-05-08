require("dotenv").config();
import("chalk").then((chalk) => {
  const express = require("express");
  const bodyParser = require("body-parser");
  const mongoose = require("mongoose");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const path = require("path"); // Import the path module
  const cookieParser = require("cookie-parser");
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname)));
  app.use(bodyParser.json());

  // MongoDB connection
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on(
    "error",
    console.error.bind(console, chalk.default.red("MongoDB connection error:"))
  );
  db.once("open", () => {
    console.log(chalk.default.green("MongoDB connected successfully"));
  });

  // Middleware to verify JWT token
  const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt; // Assuming JWT token is stored in a cookie

    // Check if token exists
    if (!token) {
      return res.redirect("/login"); // Redirect to login page if token is missing
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, "your_secret_key");
      req.user = decoded;
      next(); // Proceed to next middleware or route handler
    } catch (error) {
      res.redirect("/login"); // Redirect to login page if token is invalid
    }
  };

  // Routes
  app.get("/", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });
  app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "about.html"));
  });

  app.get("/apply", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "apply.html"));
  });

  app.get("/career", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "career.html"));
  });

  app.get("/contact", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "contact.html"));
  });

  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
  });

  app.get("/ourmentor", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "ourmentor.html"));
  });

  app.get("/program", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "program.html"));
  });

  // Serve static files (like CSS, JavaScript, images)

  // Start the server
  // User schema
  const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
  });
  const User = mongoose.model("User", userSchema);
  const applicationSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    profile: String,
    location: String,
    salary: String,
    skills: String,
    experience: String,
    brief: String,
    resume: String,
  });
  const Application = mongoose.model("Application", applicationSchema);
  const messageSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  });

  const Message = mongoose.model("Message", messageSchema);

  // Middleware

  // Routes
  app.post("/register", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
      await user.save();
      res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).send({ error: "Failed to register user" });
    }
  });
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found or password doesn't match, return error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log(user);
    res.cookie("jwt", jwt.sign({ email: user.email }, "your_secret_key"), {
      httpOnly: false,
      // Other cookie options can be added here
    });
    // If credentials are valid, create and send JWT token
    const token = jwt.sign({ email: user.email }, "your_secret_key");
    res.json({ token });
  });

  // API endpoint for handling form submission
  app.post("/submit-application", async (req, res) => {
    try {
      // Extract data from the request body
      const {
        name,
        email,
        mobile,
        profile,
        location,
        salary,
        skills,
        experience,
        brief,
        resume,
      } = req.body;
      console.log(req.body);
      console.log(
        name,
        email,
        mobile,
        profile,
        location,
        salary,
        skills,
        experience,
        brief,
        resume
      );

      // Check if all fields are filled
      if (
        !name ||
        !email ||
        !mobile ||
        !profile ||
        !location ||
        !salary ||
        !skills ||
        !experience ||
        !brief ||
        !resume
      ) {
        console.log("Please fill all fields");
        return res.status(400).json({ error: "Please fill all fields" });
      }

      // Create a new application instance
      const newApplication = new Application({
        name,
        email,
        mobile,
        profile,
        location,
        salary,
        skills,
        experience,
        brief,
        resume,
      });

      // Save the application to the database
      console.log(newApplication);

      await newApplication.save();

      // Respond with success message
      res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    contact1: String,
    contact2: String,
    course: String,
  });
  const Student = mongoose.model("Student", studentSchema);

  // Routes
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "apply.html"));
  });

  // API endpoint for handling form submission
  app.post("/submit-form", async (req, res) => {
    try {
      // Extract data from the request body
      const { name, email, contact1, contact2, course } = req.body;
      console.log(req.body);
      // Create a new student instance
      const newStudent = new Student({
        name,
        email,
        contact1,
        contact2,
        course,
      });

      // Save the student to the database
      await newStudent.save();

      // Respond with success message
      res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  app.post('/submit-message', async (req, res) => {
    try {
      const { name, email, message } = req.body;
         console.log(req.body);
         
      // Check if any required fields are missing
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill all fields' });
      }
  
      // Create a new message instance
      const newMessage = new Message({ name, email, message });
  
      // Save the message to the database
      await newMessage.save();
  
      // Return success response
      res.status(201).json({ message: 'Message submitted successfully' });
    } catch (error) {
      // Handle any errors
      console.error('Error submitting message:', error);
      res.status(500).json({ error: 'Failed to submit message' });
    }
  })
  // Add a logout route
  app.get("/logout", (req, res) => {
    // Clear the jwt cookie
    res.clearCookie("jwt");
    // Redirect to login page
    res.redirect("/login");
  });

  app.listen(port, () => {
    console.log(chalk.default.green(`Server is running on port ${port}`));
  });
});
