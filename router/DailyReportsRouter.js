const express = require("express")
require("dotenv").config();
const router = express.Router()
const EggReport = require("../models/eggReports")
const FlockReport = require("../models/flockReports")
const TotalFlocks = require("../models/TotalFlocks")
const Authentication = require("../middlewares/AuthMiddleware")
const User = require("../models/User")
const nodemailer = require("nodemailer");
const {Op} = require("sequelize")

router.post("/daily/egg/reports", Authentication, async (req, res) => {
    try {
        const { date, egg_sm_produced, egg_md_produced, egg_lg_produced, rejected } = req.body

        const userRole = req.user.role

        if (userRole !== 'employee') {
            return res.status(400).json({ message: "Only employee can post a report" })
        }

        await EggReport.create({
            date,
            egg_sm_produced,
            egg_md_produced,
            egg_lg_produced,
            rejected
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
            subject: "Employee Daily Egg Report",
            text: `This email is to notify you that an egg report for today has been submitted by one of your employees. Please log in to the website to review and take any necessary actions, such as approving or rejecting the report, in case any issues were encountered.`
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
        
        res.status(201).json({
            message: "Reports sent successfully"
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.post("/daily/flocks/reports", Authentication, async (req, res) => {
    try {
        const { date, additional_flocks, deceased_flocks, sick_flocks, cal } = req.body

        const userRole = req.user.role

        if (userRole !== 'employee') {
            return res.status(400).json({ message: "Only employee can post a report" })
        }

        const totalFlocks = await TotalFlocks.findOne({
            where: {
                id: 1
            },
            attributes: ['flocks_number']
        })

        const updatedNumberFlocks = totalFlocks.flocks_number + additional_flocks - deceased_flocks - cal

        await FlockReport.create({
            date,
            additional_flocks,
            deceased_flocks,
            sick_flocks,
            cal,
            flocks_number_before: totalFlocks.flocks_number,
            flocks_number_after: updatedNumberFlocks
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
            subject: "Employee Daily Flocks Report",
            text: `This email is to notify you that a daily flocks report has been submitted by one of your employees. Please log in to the website to review and take any necessary actions, such as approving or rejecting the report in case of any issues encountered.`
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

        res.status(200).json({ message: "Flocks Reported Success" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router