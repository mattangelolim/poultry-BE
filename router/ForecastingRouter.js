const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const ARIMA = require("arima")
const { Op } = require("sequelize")
const TotalEggs = require("../models/TotalEggs")

router.get("/production/forecastings", async (req, res) => {
    try {
        const currentDate = new Date(); // Get current date
        const twoWeeksAgo = new Date(currentDate);
        twoWeeksAgo.setDate(currentDate.getDate() - 21);

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

    
        const arimaMd = new ARIMA({ p: 2, d: 1, q: 1, verbose: false });
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

        totalEggSmProduced.push(nextValueSm);
        totalEggMdProduced.push(nextValueMd);
        totalEggLgProduced.push(nextValueLg);

        // Send response with arrays for each size
        res.json({
            egg_sm: removeUndefined(totalEggSmProduced),
            egg_md: removeUndefined(totalEggMdProduced),
            egg_lg: removeUndefined(totalEggLgProduced)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/current/eggcount", async (req,res) =>{
    try {
        const currentEgg = await TotalEggs.findAll()
        
        res.json(currentEgg)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: error.message})
    }
})
// Function to get the ISO week number of a date
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;
