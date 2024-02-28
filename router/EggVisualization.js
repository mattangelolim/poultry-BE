const express = require("express")
const router = express.Router()
const SalesProd = require("../models/SalesProd")
const { Op, fn, col } = require('sequelize');


const { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } = require('date-fns');

router.get("/daily/egg/prod", async (req, res) => {
    try {

        const dailyEggProd = await SalesProd.findAll({
            attributes: ['egg_prod', 'egg_reject', 'createdAt']
        })

        res.json(dailyEggProd)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})


router.get("/dashboard/egg/prod/weekly", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);
        let startOfWeekDate = startOfCurrentMonth;

        const weeklyEggProd = [];

        while (startOfWeekDate <= endOfCurrentMonth) {
            const endOfWeekDate = endOfWeek(startOfWeekDate);

            const eggProdAndReject = await SalesProd.findAll({
                attributes: [
                    [fn('WEEK', col('createdAt')), 'week'],
                    [fn('SUM', col('egg_prod')), 'total_egg_prod'],
                    [fn('SUM', col('egg_reject')), 'total_egg_reject']
                ],
                where: {
                    createdAt: {
                        [Op.between]: [startOfWeekDate, endOfWeekDate]
                    }
                },
                group: ['week'],
                raw: true
            });

            weeklyEggProd.push({
                startDate: startOfWeekDate,
                endDate: endOfWeekDate,
                eggProd: eggProdAndReject.map(entry => ({
                    week: entry.week,
                    total_egg_prod: entry.total_egg_prod
                })),
                eggReject: eggProdAndReject.map(entry => ({
                    week: entry.week,
                    total_egg_reject: entry.total_egg_reject
                }))
            });

            startOfWeekDate = startOfWeek(addDays(endOfWeekDate, 1)); // Move to the start of the next week
        }
        
        res.json(weeklyEggProd);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router