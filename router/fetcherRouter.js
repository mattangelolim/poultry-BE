const express = require("express")
const router = express.Router()
const TotalFlocks = require("../models/TotalFlocks")
const EggReport = require("../models/eggReports")
const EggSales = require("../models/eggSalesReport")
const Sequelize = require("sequelize")

router.get("/dashboard/flocks/dets", async (req, res) => {
    try {
        const totalFlocksDets = await TotalFlocks.findAll()

        res.status(200).json({ totalFlocksDets })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/dashboard/weekly/produced", async (req, res) => {
    try {
        const EggProd = await EggReport.findAll({
            where: {
                status: "approved"
            },
            attributes: [
                [Sequelize.literal('WEEK(createdAt)'), 'week'],
                [Sequelize.literal('SUM(egg_sm_produced + egg_md_produced + egg_lg_produced)'), 'total_eggs_produced']
            ],
            group: ['week']
        });

        res.json(EggProd);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/dashboard/weekly/sold", async (req, res) => {
    try {
        const EggProd = await EggSales.findAll({
            where: {
                status: "approved"
            },
            attributes: [
                [Sequelize.literal('WEEK(createdAt)'), 'week'],
                [Sequelize.literal('SUM(price)'), 'total_eggs_sales']
            ],
            group: ['week']
        });

        res.json(EggProd);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router