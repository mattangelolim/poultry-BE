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

router.post("/forgot/password", async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "No user found with this email." });
        }

        // Generate password reset token
        const token = jwt.sign({ userId: user.id }, process.env.RESET_PASSWORD_KEY, { expiresIn: "1h" });

        // Send the password reset token back to the client
        return res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/reset/password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
        
        if (!decodedToken) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Find user by decoded token
        const user = await User.findByPk(decodedToken.userId);
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router