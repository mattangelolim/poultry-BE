const express = require("express")
const FlockReport = require("../models/flockReports");
const router = express.Router()
const { startOfMonth, endOfMonth, startOfWeek, addMonths, format  } = require("date-fns");
const { Op, fn, col } = require('sequelize');

router.get("/flocks/visualization", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);

        // Assuming your FlockReport model has columns: additional_flocks, deceased_flocks, sick_flocks, cal, status, and date
        const flockReports = await FlockReport.findAll({
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            status: "approved"
        });

        // Initialize an object to store daily counts
        const dailyCounts = {};

        // Iterate over the flockReports and calculate daily counts
        flockReports.forEach(report => {
            const dateKey = report.date; // Extracting date without time
            if (!dailyCounts[dateKey]) {
                dailyCounts[dateKey] = {
                    additional_flocks: 0,
                    deceased_flocks: 0,
                    sick_flocks: 0,
                    cal: 0
                };
            }

            // Add values to the daily counts
            dailyCounts[dateKey].additional_flocks += report.additional_flocks;
            dailyCounts[dateKey].deceased_flocks += report.deceased_flocks;
            dailyCounts[dateKey].sick_flocks += report.sick_flocks;
            dailyCounts[dateKey].cal += report.cal;
        });

        res.status(200).json({ dailyCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/weekly/flocks/visualization", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentMonth = startOfMonth(currentDate);
        const endOfCurrentMonth = endOfMonth(currentDate);

        const flockReports = await FlockReport.findAll({
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
            status: "approved"
        });

        // Initialize an object to store weekly counts
        const weeklyCounts = {};

        // Iterate over the flockReports and calculate weekly counts
        flockReports.forEach(report => {
            const startOfWeekDate = startOfWeek(report.date);
            const weekKey = startOfWeekDate.toISOString().split('T')[0];
            if (!weeklyCounts[weekKey]) {
                weeklyCounts[weekKey] = {
                    additional_flocks: 0,
                    deceased_flocks: 0,
                    sick_flocks: 0,
                    cal: 0
                };
            }

            // Add values to the weekly counts
            weeklyCounts[weekKey].additional_flocks += report.additional_flocks;
            weeklyCounts[weekKey].deceased_flocks += report.deceased_flocks;
            weeklyCounts[weekKey].sick_flocks += report.sick_flocks;
            weeklyCounts[weekKey].cal += report.cal;
        });

        res.status(200).json({ weeklyCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/monthly/flocks/visualization", async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfJanuary = startOfMonth(new Date(currentDate.getFullYear(), 0, 1));
        const endOfDecember = endOfMonth(new Date(currentDate.getFullYear(), 11, 31));

        const FlockReportsPerMonth = await FlockReport.findAll({
            attributes: [
                [fn('MONTH', col('createdAt')), 'month'],
                [fn('YEAR', col('createdAt')), 'year'],
                [fn('SUM', col('additional_flocks')), 'total_additional_flocks'],
                [fn('SUM', col('deceased_flocks')), 'total_deceased_flocks'],
                [fn('SUM', col('sick_flocks')), 'total_sick_flocks'],
                [fn('SUM', col('cal')), 'total_cal']
            ],
            where: {
                status: 'approved',
                createdAt: {
                    [Op.gte]: startOfJanuary,
                    [Op.lte]: endOfDecember
                }
            },
            group: ['year', 'month'],
            raw: true
        });
        
        // Map month numbers to month names
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "June", 
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        
        // Update the month property to use month names
        FlockReportsPerMonth.forEach(entry => {
            entry.month = monthNames[entry.month - 1]; 
        });
        
        res.json(FlockReportsPerMonth);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});



module.exports = router