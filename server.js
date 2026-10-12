const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Temporary storage for student records
const students = [];
let nextId = 1;

// Add a student
app.post("/api/students", (req, res) => {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({
            message: "Please provide name, email, and course."
        });
    }

    const student = {
        id: nextId++,
        name: name.trim(),
        email: email.trim(),
        course: course.trim()
    };

    students.push(student);

    res.status(201).json({
        message: "Student registered successfully!",
        student
    });
});

// View all students
app.get("/api/students", (req, res) => {
    res.json(students);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Registration System running at http://localhost:${PORT}`);
});