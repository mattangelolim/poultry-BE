const express = require("express")
const router = express.Router()
const TotalFlocks = require("../models/TotalFlocks")
const EggReport = require("../models/eggReports")
const EggSales = require("../models/eggSalesReport")
const Sequelize = require("sequelize")
const SalesProd = require("../models/SalesProd")
const { fn, col } = require('sequelize');
const FlocksReport = require("../models/flockReports")

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

router.get("/dashboard/sales/prod", async (req,res) =>{
    try {

        const findEggProd = await SalesProd.findAll({
            order: [['id', 'DESC']],
            limit: 5
        })

        res.json(findEggProd)
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

router.get("/dashboard/transaction", async (req,res) =>{
    try {

        const AllTransaction = await EggSales.findAll({
            where:{
                status: 'approved'
            },
            order: [['id', 'DESC']]
        })

        res.json(AllTransaction)
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

router.get("/dashboard/egg/prod", async (req, res) => {
    try {
        const EggProdPerMonth = await SalesProd.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('YEAR', col('createdAt')), 'year'],
                [fn('SUM', col('egg_prod')), 'total_egg_prod']
            ],
            group: ['year', 'month'],
            raw: true
        });

        // Map month numbers to month names
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "June", 
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        // Update the month property to use month names
        EggProdPerMonth.forEach(entry => {
            entry.month = monthNames[entry.month - 1]; // Month number is 1-based
        });
        
        res.json(EggProdPerMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/flocks/rep/approved", async (req,res) =>{
    try {
        const flocksTable = await FlocksReport.findAll({
            where:{
                status:"approved"
            }
        })
        res.json(flocksTable)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})


module.exports = router