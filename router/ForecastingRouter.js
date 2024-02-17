const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const ARIMA = require("arima")

//NEEDS TO BE DONE
router.get("/production/forecasting", async (req, res) => {
    try {
        const eggReports = await EggReport.findAll({ where: { status: "approved" } });

        // Initialize weeks array
        const weeks = [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
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
        const arimaMd = new ARIMA({ p: 4, d: 1, q: 1, verbose: false });
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

module.exports = router;
