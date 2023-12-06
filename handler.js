const db = require("./workoutdb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");
const schedule = require("node-schedule");

// Assuming you have a createConnection function from the mysql2 library
const { createConnection } = require("mysql2");

// Promisify the db.query function
const queryAsync = util.promisify(db.query).bind(db);

const scheduledEvents = {};

const register = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user information to the database
    const connection = createConnection();
    connection.connect();

    const [results, fields] = await queryAsync(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    connection.end();

    console.log("Registration successful");
    return "Registration successful";
  } catch (error) {
    console.error("Error registering user:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const login = async (request, h) => {
  try {
    const { username, email, password } = request.payload;

    // Create a connection to the database
    const connection = createConnection();
    connection.connect();

    // Check if the user exists in the database (based on username or email)
    const [results, fields] = await queryAsync(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    // Close the database connection
    connection.end();

    if (results.length > 0) {
      // User found, check the password
      const isValidPassword = await bcrypt.compare(
        password,
        results[0].password
      );

      if (isValidPassword) {
        // Create JWT token
        const token = jwt.sign(
          { username: results[0].username, email: results[0].email },
          "rahasiakunci",
          { expiresIn: "1h" }
        );

        return { token };
      }
    }

    return "Login failed. Check your username, email, and password.";
  } catch (error) {
    console.error("Error executing login query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const getWorkout = async (request, h) => {
  try {
    const { category_id } = request.query;

    if (isNaN(category_id)) {
      return h.response({ error: "Invalid category_id" }).code(400);
    }

    const sql = "SELECT * FROM workout_info WHERE category_id = ?";

    const [hasil] = await queryAsync(sql, [category_id]);

    return h.response({
      status: "success",
      data: {
        hasil,
      },
    });
  } catch (error) {
    console.error("Error executing workout query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const getTopRatedWorkouts = async (request, h) => {
  try {
    const { category_id } = request.query;

    if (isNaN(category_id)) {
      return h.response({ error: "Invalid category_id" }).code(400);
    }

    const sql = "SELECT * FROM workout_info ORDER BY rating DESC LIMIT 5";

    const [topRatedWorkouts] = await queryAsync(sql, [category_id]);

    return h.response({
      status: "success",
      data: {
        topRatedWorkouts,
      },
    });
  } catch (error) {
    console.error("Error executing top rated workout query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const postschedule = async (request, h) => {
  try {
    const { eventId, date } = request.payload;

    if (!eventId || !date) {
      return h.response({ error: "eventId and date are required." }).code(400);
    }

    const scheduledDate = new Date(date);
    if (isNaN(scheduledDate)) {
      return h.response({ error: "Invalid date format." }).code(400);
    }

    const job = schedule.scheduleJob(eventId, scheduledDate, () => {
      console.log(`Event ${eventId} executed at ${new Date()}`);
      // You can perform additional actions here when the event is triggered
    });

    scheduledEvents[eventId] = {
      job,
      scheduledDate,
    };

    return h
      .response({ message: `Event ${eventId} scheduled successfully.` })
      .code(201);
  } catch (error) {
    console.error("Error scheduling event:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const getschedule = async (request, h) => {
  try {
    const scheduledEventsInfo = {};

    // Extract necessary information from scheduledEvents
    Object.keys(scheduledEvents).forEach((eventId) => {
      const { scheduledDate } = scheduledEvents[eventId];
      scheduledEventsInfo[eventId] = { scheduledDate };
    });

    return { scheduledEvents: scheduledEventsInfo };
  } catch (error) {
    console.error("Error getting schedule:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const deleteschedule = async (request, h) => {
  try {
    const { eventId } = request.params;

    if (!scheduledEvents[eventId]) {
      return h.response({ error: `Event ${eventId} not found.` }).code(404);
    }

    const { job, scheduledDate } = scheduledEvents[eventId];
    job.cancel();

    delete scheduledEvents[eventId];

    return { message: `Event ${eventId} canceled.` };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

module.exports = {
  register,
  login,
  getWorkout,
  getTopRatedWorkouts,
  postschedule,
  getschedule,
  deleteschedule,
};
