const express = require("express")
const router = express.Router()
const { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, addMonths, format } = require("date-fns");
const SalesReport = require("../models/eggSalesReport")
const { Op } = require("sequelize")

router.get("/daily/sales/visual", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);

        // Assuming your EggSalesReport model has columns: egg_type, date, and quantity
        const dailySales = await SalesReport.findAll({
            attributes: ["egg_type", "date", "quantity", ],
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            where: {
                status: "approved",
            },
            raw: true,
        });

        // Initialize an object to store aggregated sales per date
        const aggregatedSalesByDate = {};

        dailySales.forEach((sale) => {
            const { egg_type, date, quantity } = sale;

            // Format the date to match your desired output
            const formattedDate = format(new Date(date), "yyyy-MM-dd");

            // Create an entry for the date
            if (!aggregatedSalesByDate[formattedDate]) {
                aggregatedSalesByDate[formattedDate] = {
                    date: formattedDate,
                    egg_sm: 0,
                    egg_md: 0,
                    egg_lg: 0,
                };
            }

            // Update the aggregated sales based on egg type and add quantity
            aggregatedSalesByDate[formattedDate][egg_type.toLowerCase()] += quantity;
        });

        // Convert the object values to an array
        const result = Object.values(aggregatedSalesByDate);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/daily/pricesales/visual", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);

        // Assuming your EggSalesReport model has columns: egg_type, date, and quantity
        const dailySales = await SalesReport.findAll({
            attributes: ["egg_type", "date", "price", ],
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            where: {
                status: "approved",
            },
            raw: true,
        });

        // Initialize an object to store aggregated sales per date
        const aggregatedSalesByDate = {};

        dailySales.forEach((sale) => {
            const { egg_type, date, price } = sale;

            // Format the date to match your desired output
            const formattedDate = format(new Date(date), "yyyy-MM-dd");

            // Create an entry for the date
            if (!aggregatedSalesByDate[formattedDate]) {
                aggregatedSalesByDate[formattedDate] = {
                    date: formattedDate,
                    egg_sm: 0,
                    egg_md: 0,
                    egg_lg: 0,
                };
            }

            // Update the aggregated sales based on egg type and add quantity
            aggregatedSalesByDate[formattedDate][egg_type.toLowerCase()] += parseFloat(price);
        });

        // Convert the object values to an array
        const result = Object.values(aggregatedSalesByDate);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/weekly/sales/visual", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);

        // Initialize an object to store aggregated sales per week
        const aggregatedSalesByWeek = {};

        // Assuming your EggSalesReport model has columns: egg_type, date, and quantity
        const weeklySales = await SalesReport.findAll({
            attributes: ["egg_type", "date", "quantity"],
            where: {
                date: {
                    [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
                },
                status: "approved",
            },
            raw: true,
        });

        weeklySales.forEach((sale) => {
            const { egg_type, date, quantity } = sale;

            // Format the date to match your desired output
            const formattedDate = format(new Date(date), "yyyy-MM-dd");

            // Determine the week for the current sale
            const startOfWeekDate = startOfWeek(new Date(date));
            const weekKey = format(startOfWeekDate, "yyyy-MM-dd");

            // Create an entry for the week if it doesn't exist
            if (!aggregatedSalesByWeek[weekKey]) {
                aggregatedSalesByWeek[weekKey] = {
                    week_start: weekKey,
                    egg_sm: 0,
                    egg_md: 0,
                    egg_lg: 0,
                };
            }

            // Update the aggregated sales based on egg type and add quantity
            aggregatedSalesByWeek[weekKey][egg_type.toLowerCase()] += quantity;
        });

        // Convert the object values to an array
        const result = Object.values(aggregatedSalesByWeek);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/monthly/sales/visual", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfJanuary = startOfMonth(new Date(currentDate.getFullYear(), 0, 1));
        const endOfDecember = endOfMonth(new Date(currentDate.getFullYear(), 11, 31));

        // Initialize an object to store aggregated sales data per month
        const aggregatedSalesByMonth = {};

        // Assuming your SalesReport model has columns: egg_type, date, quantity, and status
        const monthlySales = await SalesReport.findAll({
            attributes: ["egg_type", "date", "quantity"],
            where: {
                status: "approved",
                createdAt: {
                    [Op.gte]: startOfJanuary,
                    [Op.lte]: endOfDecember
                }
            },
            raw: true
        });

        monthlySales.forEach((sale) => {
            const { egg_type, date, quantity } = sale;

            // Format the date to match your desired output
            const formattedDate = format(new Date(date), "yyyy-MM");

            // Create an entry for the month if it doesn't exist
            if (!aggregatedSalesByMonth[formattedDate]) {
                aggregatedSalesByMonth[formattedDate] = {
                    month: format(new Date(date), "MMM"), // Update month property to use month names
                    egg_sm: 0,
                    egg_md: 0,
                    egg_lg: 0,
                };
            }

            // Update the aggregated sales data based on egg type and add quantity
            aggregatedSalesByMonth[formattedDate][egg_type.toLowerCase()] += quantity;
        });

        // Convert the object values to an array
        const result = Object.values(aggregatedSalesByMonth);

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router