const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const ARIMA = require("arima")
const { Op } = require("sequelize")

//NEEDS TO BE DONE
router.get("/production/forecasting", async (req, res) => {
    try {
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 14); 
        console.log(threeWeeksAgo)

        const eggReports = await EggReport.findAll({
            where: {
                status: "approved",
                updatedAt: { [Op.gte]: threeWeeksAgo } 
            }
        });

        // Initialize weeks array
        const weeks = [];
        // const currentDate = new Date();
        const currentDate = new Date();


        const currentMonth = currentDate.getMonth() + 1;
        console.log(currentMonth)
        const daysInMonth = new Date(currentDate.getFullYear(), currentMonth, 0).getDate();
        let weekStart = 1;
        while (weekStart <= daysInMonth) {
            const weekEnd = Math.min(weekStart + 6, daysInMonth);
            weeks.push({ start: weekStart, end: weekEnd });
            weekStart = weekEnd + 1;
        }

        // Initialize result object
        const result = {};

        // Iterate through eggReports and group by week
        eggReports.forEach(report => {
            const reportDate = new Date(report.date);
            const reportWeek = weeks.find(week => reportDate.getDate() >= week.start && reportDate.getDate() <= week.end);
            console.log(reportWeek)
            const weekKey = `Week ${weeks.indexOf(reportWeek) + 1}`;

            // Initialize week if not already initialized
            if (!result[weekKey]) {
                result[weekKey] = {
                    total_egg_sm_produced: 0,
                    total_egg_md_produced: 0,
                    total_egg_lg_produced: 0
                };
            }

            // Add egg production to the corresponding week
            result[weekKey].total_egg_sm_produced += report.egg_sm_produced;
            result[weekKey].total_egg_md_produced += report.egg_md_produced;
            result[weekKey].total_egg_lg_produced += report.egg_lg_produced;
        });
        const eggSmProducedArray = [];
        const eggMdProducedArray = [];
        const eggLgProducedArray = [];


        for (let i = 1; i <= 3; i++) {
            const weekKey = `Week ${i}`;
            if (result[weekKey]) {
                eggSmProducedArray.push(result[weekKey].total_egg_sm_produced);
                eggMdProducedArray.push(result[weekKey].total_egg_md_produced);
                eggLgProducedArray.push(result[weekKey].total_egg_lg_produced);
            }
        }

        const arimaSm = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaSm.train(eggSmProducedArray);
        const arimaMd = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaMd.train(eggMdProducedArray);
        const arimaLg = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaLg.train(eggLgProducedArray);

        // Predict next values for each egg size
        const [predictionsSm] = arimaSm.predict(1);


        const [predictionsMd] = arimaMd.predict(1);

        const [predictionsLg] = arimaLg.predict(1);



        const nextValueSm = Math.round(predictionsSm[0]) < 0 ? 0 : Math.round(predictionsSm[0]);
        const nextValueMd = Math.round(predictionsMd[0]) < 0 ? 0 : Math.round(predictionsMd[0]);
        const nextValueLg = Math.round(predictionsLg[0]) < 0 ? 0 : Math.round(predictionsLg[0]);
        // Construct response object
        const response = {
            lastThreeWeeks: {
                egg_sm_produced: eggSmProducedArray,
                egg_md_produced: eggMdProducedArray,
                egg_lg_produced: eggLgProducedArray
            },
            predictedValue: {
                egg_sm_produced: nextValueSm,
                egg_md_produced: nextValueMd,
                egg_lg_produced: nextValueLg
            }
        };

        // Send response
        res.json(response);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/production/forecastings", async (req, res) => {
    try {
        const currentDate = new Date(); // Get current date
        const twoWeeksAgo = new Date(currentDate);
        twoWeeksAgo.setDate(currentDate.getDate() - 14);

        const eggReports = await EggReport.findAll({
            where: {
                status: "approved",
                updatedAt: { 
                    [Op.between]: [twoWeeksAgo, currentDate] 
                } 
            }
        });

        // Initialize result array
        const result = [];

        // Iterate through eggReports and compile rows of the same week
        eggReports.forEach(report => {
            const reportDate = new Date(report.updatedAt);
            const weekNumber = getWeekNumber(reportDate);

            // Find the start and end dates of the week
            const weekStartDate = new Date(reportDate);
            weekStartDate.setDate(reportDate.getDate() - reportDate.getDay()); // Start of the week (Sunday)
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6); // End of the week (Saturday)

            // Find or create the week object in the result array
            let weekObj = result.find(item => item.weekNumber === weekNumber);
            if (!weekObj) {
                weekObj = {
                    weekNumber: weekNumber,
                    startDate: weekStartDate.toISOString().split('T')[0], 
                    endDate: weekEndDate.toISOString().split('T')[0], 
                    total_egg_sm_produced: 0,
                    total_egg_md_produced: 0,
                    total_egg_lg_produced: 0
                };
                result.push(weekObj);
            }

            // Add egg production to the corresponding week
            weekObj.total_egg_sm_produced += report.egg_sm_produced;
            weekObj.total_egg_md_produced += report.egg_md_produced;
            weekObj.total_egg_lg_produced += report.egg_lg_produced;
        });

        // Send response
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Function to get the ISO week number of a date
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;
