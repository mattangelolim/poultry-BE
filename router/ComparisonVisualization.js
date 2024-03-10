const express = require("express")
const router = express.Router()
const { startOfDay, endOfDay, endOfWeek, startOfMonth, endOfMonth, startOfWeek, addMonths, addDays, format } = require("date-fns");
const SalesProd = require("../models/SalesProd")
const { Op, col, fn } = require("sequelize")

router.get("/daily/comparison", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);
        const SalesProdRej = await SalesProd.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startOfCurrentMonth, endOfCurrentMonth]
                }
            }
        });

        const adjustedSalesProdRej = SalesProdRej.map(sale => ({
            id: sale.id,
            egg_prod: sale.egg_prod,
            egg_reject: sale.egg_reject,
            egg_sales: sale.egg_sales,
            createdAt: sale.createdAt.toISOString().split('T')[0] 
        }));

        res.json(adjustedSalesProdRej);

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/weekly/comparison", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);
        
        // Calculate the start and end dates for each week within the current month
        const weeks = [];
        let startOfWeekDate = startOfCurrentMonth;
        while (startOfWeekDate <= endOfCurrentMonth) {
            const endOfWeekDate = endOfWeek(startOfWeekDate);
            weeks.push({ start: startOfWeekDate.toISOString().split('T')[0], end: endOfWeekDate.toISOString().split('T')[0] });
            startOfWeekDate = addDays(endOfWeekDate, 1);
        }

        // Query and sum up sales data for each week
        const weeklySalesData = [];
        for (const week of weeks) {
            const SalesProdRej = await SalesProd.findAll({
                attributes: [
                    [fn('sum', col('egg_prod')), 'total_egg_prod'],
                    [fn('sum', col('egg_reject')), 'total_egg_reject'],
                    [fn('sum', col('egg_sales')), 'total_egg_sales']
                ],
                where: {
                    createdAt: {
                        [Op.between]: [week.start, week.end]
                    }
                }
            });

     
            const totalEggProd = SalesProdRej[0].dataValues.total_egg_prod || 0;
            const totalEggReject = SalesProdRej[0].dataValues.total_egg_reject || 0;
            const totalEggSales = SalesProdRej[0].dataValues.total_egg_sales || 0;

            weeklySalesData.push({
                start_of_week: week.start,
                total_egg_prod: totalEggProd,
                total_egg_reject: totalEggReject,
                total_egg_sales: totalEggSales
            });
        }

        res.json(weeklySalesData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/monthly/comparison", async (req, res) => {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "June", 
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        const monthlySalesData = [];
        for (let i = 0; i < 12; i++) {
            const startOfMonthDate = new Date(currentYear, i, 1);
            const endOfMonthDate = endOfMonth(startOfMonthDate);
            
            const SalesProdRej = await SalesProd.findAll({
                attributes: [
                    [fn('sum', col('egg_prod')), 'total_egg_prod'],
                    [fn('sum', col('egg_reject')), 'total_egg_reject'],
                    [fn('sum', col('egg_sales')), 'total_egg_sales']
                ],
                where: {
                    createdAt: {
                        [Op.between]: [startOfMonthDate, endOfMonthDate]
                    }
                }
            });

            const totalEggProd = SalesProdRej[0].dataValues.total_egg_prod || 0;
            const totalEggReject = SalesProdRej[0].dataValues.total_egg_reject || 0;
            const totalEggSales = SalesProdRej[0].dataValues.total_egg_sales || 0;

            monthlySalesData.push({
                month: monthNames[i],
                total_egg_prod: totalEggProd,
                total_egg_reject: totalEggReject,
                total_egg_sales: totalEggSales
            });
        }

        res.json(monthlySalesData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router