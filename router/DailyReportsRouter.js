const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const TotalEggs = require("../models/TotalEggs")
const Authentication = require("../middlewares/AuthMiddleware")

router.post("/daily/reports", Authentication, async (req, res) => {
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

        res.status(200).json({message: "Eggs Reported Success"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router