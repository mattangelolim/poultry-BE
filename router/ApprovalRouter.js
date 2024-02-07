const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const TotalEggs = require("../models/TotalEggs")
const Authentication = require("../middlewares/AuthMiddleware")

router.post("/eggreport/approved", Authentication, async (req, res) => {
    try {
        const { id, approval } = req.body
        const userRole = req.user.role
        // console.log(userRole)

        if (userRole === "employee") {
            return res.status(400).json({ message: "Employee cannot approve report" })
        }

        const eggReport = await EggReport.findByPk(id);

        eggReport.status = approval;
        await eggReport.save();

        const totalEggsBeforeApproval = await TotalEggs.findAll({
            attributes: ['egg_type', 'egg_quantity'],
        });
        console.log("before", totalEggsBeforeApproval)

        if (approval === "approved") {
            const egg_sm_qty = eggReport.egg_sm_produced
            const egg_md_qty = eggReport.egg_md_produced
            const egg_lg_qty = eggReport.egg_lg_produced
    
            await TotalEggs.increment('egg_quantity', {
                by: egg_sm_qty,
                where: {
                    egg_type: 'egg_sm',
                },
            });
    
            await TotalEggs.increment('egg_quantity', {
                by: egg_md_qty,
                where: {
                    egg_type: 'egg_md',
                },
            });
    
            await TotalEggs.increment('egg_quantity', {
                by: egg_lg_qty,
                where: {
                    egg_type: 'egg_lg',
                },
            });
        }
        const totalEggsAfterApproval = await TotalEggs.findAll({
            attributes: ['egg_type', 'egg_quantity'],
        });

        console.log("after", totalEggsAfterApproval)

        res.status(200).json({ message: "Status Updated Successfully" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router