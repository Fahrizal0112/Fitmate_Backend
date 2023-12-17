const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createConnection = require("./workoutdb");

// Handler Register

const register = async (request, h) => {
  const { username, email, password } = request.payload;

  const db = await createConnection();

  const [usernameRows] = await db.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (usernameRows.length > 0) {
    return h.response({
      status: "Error",
      message: "Username sudah terdaftar, mohon gunakan username yang lain",
      code: 400,
    });
  }

  const [emailRows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (emailRows.length > 0) {
    return h.response({
      status: "Error",
      message: "Email sudah terdaftar",
      code: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [rows, fields] = await db.execute(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword]
  );

  return h.response({
    status: "Success",
    message: "Data berhasil ditambahkan",
    code: 201,
  });
};

// Handler Login

const login = async (request, h) => {
  const { username, email, password } = request.payload;
  console.log(username, email, password);

  // Pastikan username atau email dan password tersedia
  if (!username && !email) {
    return "Login gagal. Harap masukkan username atau email.";
  }
  if (!password) {
    return "Login gagal. Harap masukkan password.";
  }

  const db = await createConnection();

  let query = "";
  let queryParams = [];

  if (username) {
    query = "SELECT * FROM users WHERE username = ?";
    queryParams = [username];
  } else if (email) {
    query = "SELECT * FROM users WHERE email = ?";
    queryParams = [email];
  }

  const [rows, fields] = await db.execute(query, queryParams);

  if (rows.length > 0) {
    const isValidPassword = await bcrypt.compare(password, rows[0].password);

    if (isValidPassword) {
      const token = jwt.sign(
        { username: rows[0].username, email: rows[0].email },
        "rahasiakunci",
        { expiresIn: "1h" }
      );

      return h.response({
        status: "Success",
        message: "Berhasil Login",
        code: 200,
      });
    }
  }

  return h.response({
    status: "Failed",
    message:
      "Login gagal. Periksa kembali username, email, dan password Anda yaa...",
    code: 404,
  });
};

const getExercise = async (request, h) => {
  const { muscle_id } = request.query;

  if (isNaN(muscle_id)) {
    return h.response({ error: "Invalid muscle_id" }).code(400);
  }

  const db = await createConnection();

  const sql = `
    SELECT
      e.id,
      e.name,
      e.rating,
      e.level,
      e.cal_estimation,
      e.required_equipment,
      e.overview,
      c.name AS category_name,
      e.is_support_interactive,
      m.name AS muscle_name,
      e.gif_url,
      e.photo_url
    FROM
      exercise e
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN muscle m ON e.muscle_id = m.id
    WHERE
      e.muscle_id = ?
  `;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql, [muscle_id]);

    // Check if there are rows returned
    if (rows.length === 0) {
      return h.response({ error: "No matching data found" }).code(404);
    }

    // Map the rows to the desired response format
    const exerciseData = rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      level: row.level,
      cal_estimation: row.cal_estimation,
      required_equipment: row.required_equipment,
      overview: row.overview,
      category: {
        name: row.category_name,
      },
      is_support_interactive: row.is_support_interactive,
      muscle: {
        name: row.muscle_name,
      },
      gif_url: row.gif_url,
      photo_url: row.photo_url,
    }));

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: 200,
      data: exerciseData,
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

const getExerciseByEquipment = async (request, h) => {
  const { equipment } = request.query;

  if (!equipment) {
    return h.response({ error: "Missing equipment parameter" }).code(400);
  }

  const db = await createConnection();

  const sql = `
    SELECT
      e.id,
      e.name,
      e.rating,
      e.level,
      e.cal_estimation,
      e.required_equipment,
      e.overview,
      e.step,
      c.name AS category_name,
      e.is_support_interactive,
      m.name AS muscle_name,
      e.gif_url,
      e.photo_url
    FROM
      exercise e
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN muscle m ON e.muscle_id = m.id
      LEFT JOIN equipment eq ON e.equipment_id = eq.id
    WHERE
      eq.name = ?
  `;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql, [equipment]);

    // Check if there are rows returned
    if (rows.length === 0) {
      return h.response({ error: "No matching data found" }).code(404);
    }

    // Assuming there is only one result for simplicity
    const exerciseData = rows[0];

    const response = {
      data: {
        id: exerciseData.id,
        name: exerciseData.name,
        rating: exerciseData.rating,
        level: exerciseData.level,
        cal_estimation: exerciseData.cal_estimation,
        required_equipment: {
          name: equipment,
        },
        overview: exerciseData.overview,
        step: exerciseData.step,
        category: {
          name: exerciseData.category_name,
        },
        is_support_interactive: exerciseData.is_support_interactive,
        muscle: {
          name: exerciseData.muscle_name,
        },
        gif_url: exerciseData.gif_url,
        photo_url: exerciseData.photo_url,
      },
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

const getExerciseByQuery = async (request, h) => {
  const { query } = request.query;

  if (!query) {
    return h
      .response({ error: "Invalid or missing query parameter" })
      .code(400);
  }

  const db = await createConnection();

  const sql = `
    SELECT
      e.id,
      e.name,
      e.rating,
      e.level,
      e.cal_estimation,
      e.required_equipment,
      e.overview,
      c.name AS category_name,
      e.is_support_interactive,
      m.name AS muscle_name,
      e.gif_url,
      e.photo_url
    FROM
      exercise e
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN muscle m ON e.muscle_id = m.id
    WHERE
      e.name LIKE ?
  `;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql, [`%${query}%`]);

    // Check if there are rows returned
    if (rows.length === 0) {
      return h.response({ error: "No matching data found" }).code(404);
    }

    // Map the rows to the desired response format
    const exerciseData = rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      level: row.level,
      cal_estimation: row.cal_estimation,
      required_equipment: row.required_equipment,
      overview: row.overview,
      category: {
        name: row.category_name,
      },
      is_support_interactive: row.is_support_interactive,
      muscle: {
        name: row.muscle_name,
      },
      gif_url: row.gif_url,
      photo_url: row.photo_url,
    }));

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: 200,
      data: exerciseData,
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

const getDetailExercise = async (request, h) => {
  const { exercise_id } = request.query;

  if (!exercise_id) {
    return h.response({ error: "Missing exercise_name parameter" }).code(400);
  }

  const db = await createConnection();

  const sql = `
    SELECT
      e.id,
      e.name,
      e.rating,
      e.level,
      e.cal_estimation,
      e.required_equipment,
      e.overview,
      e.step,
      e.body_part_needed,
      c.name AS category_name,
      e.is_support_interactive,
      i.repetition AS interactive_repetition,
      i.set_count AS interactive_set_count,
      i.rest_interval AS interactive_rest_interval,
      b.rightArm,
      b.leftArm,
      b.rightLeg,
      b.leftLeg,
      m.name AS muscle_name,
      e.gif_url,
      e.photo_url
    FROM
      exercise e
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN interactive_exercise_setting i ON e.interactive_setting_id = i.id
      LEFT JOIN body_part_segment_value b ON e.interactive_body_part_segment_value_id = b.id
      LEFT JOIN muscle m ON e.muscle_id = m.id
    WHERE
      e.id = ?
  `;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql, [exercise_id]);

    // Check if there are rows returned
    if (rows.length === 0) {
      return h.response({ error: "No matching data found" }).code(404);
    }

    // Assuming there is only one result for simplicity
    const exerciseData = rows[0];

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: 200,
      data: {
        id: exerciseData.id,
        name: exerciseData.name,
        rating: exerciseData.rating,
        level: exerciseData.level,
        cal_estimation: exerciseData.cal_estimation,
        required_equipment: exerciseData.required_equipment,
        overview: exerciseData.overview,
        step: exerciseData.step,
        body_part_needed: exerciseData.body_part_needed.split(","),
        category: {
          name: exerciseData.category_name,
        },
        is_support_interactive: exerciseData.is_support_interactive,
        interactive_setting: {
          repetition: exerciseData.interactive_repetition,
          set: exerciseData.interactive_set_count,
          rest_interval: exerciseData.interactive_rest_interval,
        },
        interactive_body_part_segment_value: {
          rightArm: exerciseData.rightArm,
          leftArm: exerciseData.leftArm,
          rightLeg: exerciseData.rightLeg,
          leftLeg: exerciseData.leftLeg,
        },
        muscle: {
          name: exerciseData.muscle_name,
        },
        gif_url: exerciseData.gif_url,
        photo_url: exerciseData.photo_url,
      },
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing workout query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

const getMuscle = async (request, h) => {
  const db = await createConnection();

  const sql = `SELECT * FROM muscle`;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql);

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: 200,
      data: rows,
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

const getCategory = async (request, h) => {
  const db = await createConnection();

  const sql = `SELECT * FROM category`;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql);

    // Assuming there is only one result for simplicity
    const categoryData = rows[0];

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: rows,
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

//Handler getTopRatedWorkouts berfungsi untuk mengambil workout dengan rating terbaik

const getTopRatedExercise = async (request, h) => {
  const { limit } = request.query;

  if (isNaN(limit)) {
    return h.response({ error: "Invalid limit" }).code(400);
  }
  const db = await createConnection();

  const sql = `
    SELECT
      e.id,
      e.name,
      e.rating,
      e.level,
      e.cal_estimation,
      e.required_equipment,
      e.overview,
      c.name AS category_name,
      e.is_support_interactive,
      m.name AS muscle_name,
      e.gif_url,
      e.photo_url
    FROM
      exercise e
      LEFT JOIN category c ON e.category_id = c.id
      LEFT JOIN muscle m ON e.muscle_id = m.id
    ORDER BY
      e.rating
    DESC LIMIT ?
  `;

  try {
    // Menggunakan fungsi execute untuk mengeksekusi kueri
    const [rows, fields] = await db.execute(sql, [limit]);

    // Check if there are rows returned
    if (rows.length === 0) {
      return h.response({ error: "No matching data found" }).code(404);
    }

    // Map the rows to the desired response format
    const exerciseData = rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: row.rating,
      level: row.level,
      cal_estimation: row.cal_estimation,
      required_equipment: row.required_equipment,
      overview: row.overview,
      category: {
        name: row.category_name,
      },
      is_support_interactive: row.is_support_interactive,
      muscle: {
        name: row.muscle_name,
      },
      gif_url: row.gif_url,
      photo_url: row.photo_url,
    }));

    const response = {
      status: "Success",
      message: "Data berhasil diambil",
      code: 200,
      data: exerciseData,
    };

    return h.response(response);
  } catch (error) {
    console.error("Error executing exercise query:", error);
    return h.response({ error: "Internal Server Error" }).code(500);
  } finally {
    // Mengakhiri koneksi setelah kueri selesai dieksekusi
    await db.end();
  }
};

module.exports = {
  register,
  login,
  getExercise,
  getExerciseByEquipment,
  getExerciseByQuery,
  getDetailExercise,
  getMuscle,
  getCategory,
  getTopRatedExercise,
};
