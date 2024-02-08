const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const FlockReport = require("../models/flockReports")
const TotalFlocks = require("../models/TotalFlocks")
const Authentication = require("../middlewares/AuthMiddleware")

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

        res.status(200).json({ message: "Eggs Reported Success" })

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

        res.status(200).json({ message: "Flocks Reported Success" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router