const express = require("express");
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Authentication = require("../middlewares/AuthMiddleware")

router.post("/login/admin", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(200).json({ error: "Missing username or password." });
        }

        // Find the admin user in the database
        const admin = await User.findOne({
            where: {
                username: username
            }
        });

        // Check if the admin exists
        if (!admin) {
            return res.status(200).json({ error: "Invalid credentials. wrong username" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(200).json({ error: "Invalid credentials. wrong password" });
        }

        // Create and sign a JWT token
        const token = jwt.sign({ userId: admin.id, username: admin.username, email: admin.email, role: admin.role }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        // Respond with the generated token
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


router.post("/register/admin", Authentication, async (req, res) => {
    try {
        const { name, email, role, username, password } = req.body;

        const userRole = req.user.role;

        // VERIFY IF THE PAYLOAD IN TOKEN CONTAINS SUPERADMIN ROLE
        if (userRole !== 'superadmin') {
            return res.status(400).json({ message: "Only superadmin can create or register a user" });
        }

        // CHECK IF THE USER EXISTS
        const findRow = await User.findOne({
            where: {
                email: email,
                username: username
            }
        });

        if (findRow) {
            return res.status(400).json({ message: "User already exists" });
        }

        // HASH THE PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // CREATE USER WITH HASHED PASSWORD
        await User.create({
            name,
            email,
            role,
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: "User Created Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router