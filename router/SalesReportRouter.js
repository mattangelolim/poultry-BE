const express = require("express")
const router = express.Router()
const Authentication = require("../middlewares/AuthMiddleware")
const EggSales = require("../models/eggSalesReport")
const TotalEggs = require("../models/TotalEggs")
const User = require("../models/User")
const { Op } = require("sequelize")
const nodemailer = require("nodemailer")

router.post("/sales/report", Authentication, async (req, res) => {
    try {
        const { date, buyer_name, egg_type, quantity } = req.body
        const userRole = req.user.role

        if (userRole !== 'employee') {
            res.status(400).json({ message: "Only employee can report sales" })
        }

        const findRowTotalEgg = await TotalEggs.findOne({
            where: {
                egg_type: egg_type
            },
            attributes: ['egg_quantity', 'egg_cost']
        })

        if (findRowTotalEgg.egg_quantity < quantity) {
            return res.status(400).json({ message: "Inputted quantity is greater than the inventory quantity" })
        }

        const totalPrice = quantity * findRowTotalEgg.egg_cost

        await EggSales.create({
            date,
            buyer_name,
            egg_type,
            quantity,
            price: totalPrice
        })

        const userEmails = await User.findAll({
            where: {
                role: {
                    [Op.ne]: 'employee'
                }
            },
            attributes: ['email']
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GM_MAIL, // Your email address
                pass: process.env.GM_PASS, // Your email password
            },
        });

        const mailOptions = {
            from: process.env.GM_MAIL,
            subject: "Egg Sale Report",
            text: `Dear Management,

            We're pleased to inform you that an egg sale report for today has been submitted by one of our employees.

            Thank you for your continued support.`
        };

        // Loop through each user email and send the email
        userEmails.forEach(async (user) => {
            mailOptions.to = user.email;
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent to: " + user.email);
            } catch (error) {
                console.error("Error sending email to " + user.email + ": ", error);
            }
        });

        res.json({ message: "Egg Sales Reported Success" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router