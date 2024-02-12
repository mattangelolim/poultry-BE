const express = require("express")
const EggReport = require("../models/eggReports")
const SalesReport = require("../models/eggSalesReport")
const FlocksReport = require("../models/flockReports")
const { Op } = require("sequelize")
const router = express.Router()

router.get("/fetch/egg/approval", async (req, res) => {
    try {
        const approvalReports = await EggReport.findAll({
            where: {
                status: "pending"
            }
        })
        res.json(approvalReports)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/fetch/sales/approval", async (req, res) => {
    try {
        const approvalReports = await SalesReport.findAll({
            where: {
                status: "pending"
            }
        })
        res.json(approvalReports)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/fetch/flocks/approval", async (req, res) => {
    try {
        const approvalReports = await FlocksReport.findAll({
            where: {
                status: "pending"
            }
        })
        res.json(approvalReports)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/fetch/egg/visualization", async (req, res) => {
    try {
        const approvalReports = await EggReport.findAll({
            where: {
                status: {
                    [Op.ne]: "pending" // Use Op.ne (not equal) operator to find reports where status is not "pending"
                }
            }
        });
        res.json(approvalReports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router