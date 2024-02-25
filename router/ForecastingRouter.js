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

        // console.log(eggSmProducedArray)

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

        // Initialize arrays to hold totals for each size
        const totalEggSmProduced = [];
        const totalEggMdProduced = [];
        const totalEggLgProduced = [];

        // Iterate through eggReports and compile totals for each size
        eggReports.forEach(report => {
            const reportDate = new Date(report.updatedAt);
            reportDate.setHours(reportDate.getHours() + 8);

            const weekNumber = getWeekNumber(reportDate);

            // If the total arrays do not have values for this week, initialize them
            if (!totalEggSmProduced[weekNumber]) totalEggSmProduced[weekNumber] = 0;
            if (!totalEggMdProduced[weekNumber]) totalEggMdProduced[weekNumber] = 0;
            if (!totalEggLgProduced[weekNumber]) totalEggLgProduced[weekNumber] = 0;

            // Add egg production to the corresponding week and size array
            totalEggSmProduced[weekNumber] += report.egg_sm_produced;
            totalEggMdProduced[weekNumber] += report.egg_md_produced;
            totalEggLgProduced[weekNumber] += report.egg_lg_produced;
        });

        // Remove undefined values from arrays
        const removeUndefined = arr => arr.filter(val => val !== undefined);
        console.log(removeUndefined(totalEggSmProduced))

        const arimaSm = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaSm.train(removeUndefined(totalEggSmProduced));

    
        const arimaMd = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaMd.train(removeUndefined(totalEggMdProduced));
        const arimaLg = new ARIMA({ p: 1, d: 1, q: 1, verbose: false });
        arimaLg.train(removeUndefined(totalEggLgProduced));

        // Predict the fourth value for each size array
        const [predictedSm] = arimaSm.predict(1);
        const [predictedMd] = arimaMd.predict(1);
        const [predictedLg] = arimaLg.predict(1);

        const nextValueSm = Math.round(predictedSm[0]) < 0 ? 0 : Math.round(predictedSm[0]);
        const nextValueMd = Math.round(predictedMd[0]) < 0 ? 0 : Math.round(predictedMd[0]);
        const nextValueLg = Math.round(predictedLg[0]) < 0 ? 0 : Math.round(predictedLg[0]);

        // Send response with arrays for each size
        res.json({
            egg_sm: removeUndefined(totalEggSmProduced),
            egg_md: removeUndefined(totalEggMdProduced),
            egg_lg: removeUndefined(totalEggLgProduced),
            egg_sm_predicted: nextValueSm,
            egg_md_predicted: nextValueMd,
            egg_lg_predicted: nextValueLg
        });
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
