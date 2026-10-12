require("dotenv").config();

const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 5
});

// Add a student
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof course !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !course.trim()
        ) {
            return res.status(400).json({
                message: "Please provide name, email, and course."
            });
        }

        const sql = `
            INSERT INTO students (name, email, course)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            name.trim(),
            email.trim(),
            course.trim()
        ]);

        res.status(201).json({
            message: "Student registered successfully!",
            student: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim(),
                course: course.trim()
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "A student with this email already exists."
            });
        }

        console.error("Registration error:", error.message);
        res.status(500).json({
            message: "Unable to register student."
        });
    }
});

// View all students
app.get("/api/students", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, name, email, course, created_at
             FROM students
             ORDER BY id DESC`
        );

        res.json(rows);
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).json({
            message: "Unable to load student records."
        });
    }
});

// Test database connectivity and start the server
async function startServer() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Student Registration System running on port ${PORT}`);
            console.log("MySQL database connected successfully.");
        });
    } catch (error) {
        console.error("Could not connect to MySQL:", error.message);
        process.exit(1);
    }
}

startServer();