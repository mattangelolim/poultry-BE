const express = require("express")
const router = express.Router()
const EggReport = require("../models/eggReports")
const EggCount = require("../models/eggCounts")
const TotalFlocks = require("../models/TotalFlocks")
const FlocksReport = require("../models/flockReports")
const TotalEggs = require("../models/TotalEggs")
const Authentication = require("../middlewares/AuthMiddleware")
const SalesReport = require("../models/eggSalesReport")
const SalesProd = require("../models/SalesProd")
const { Op, fn, col } = require('sequelize');
const { startOfDay, endOfDay } = require("date-fns")

router.post("/eggreport/approved", Authentication, async (req, res) => {
    try {
        const { id, approval } = req.body
        const userRole = req.user.role

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
            const rejected = eggReport.rejected

            const totalqty = egg_lg_qty + egg_md_qty + egg_sm_qty

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

            const currentDate = new Date();


            const startOfToday = startOfDay(currentDate);
            const endOfToday = endOfDay(currentDate);

            // Find the entry for the current date
            let existingEntry = await SalesProd.findOne({
                where: {
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            });

            console.log(existingEntry);

            if (existingEntry) {
                // If entry exists, update it
                existingEntry.egg_prod += totalqty;
                existingEntry.egg_reject += rejected;
                await existingEntry.save();
            } else {
                // If entry doesn't exist, create a new one
                await SalesProd.create({
                    egg_prod: totalqty,
                    egg_reject: rejected
                });
            }

            const egg_before_sm = totalEggsBeforeApproval.find((egg) => egg.egg_type === 'egg_sm').egg_quantity;
            const egg_before_md = totalEggsBeforeApproval.find((egg) => egg.egg_type === 'egg_md').egg_quantity;
            const egg_before_lg = totalEggsBeforeApproval.find((egg) => egg.egg_type === 'egg_lg').egg_quantity;

            await EggCount.create({
                egg_type: 'egg_sm',
                egg_before: egg_before_sm,
                egg_after: egg_before_sm + eggReport.egg_sm_produced,
            });

            await EggCount.create({
                egg_type: 'egg_md',
                egg_before: egg_before_md,
                egg_after: egg_before_md + eggReport.egg_md_produced,
            });

            await EggCount.create({
                egg_type: 'egg_lg',
                egg_before: egg_before_lg,
                egg_after: egg_before_lg + eggReport.egg_lg_produced,
            });
        }

        res.status(200).json({ message: "Status Updated Successfully" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.post("/flocksreport/approved", Authentication, async (req, res) => {
    try {
        const { id, approval } = req.body
        const userRole = req.user.role

        if (userRole === "employee") {
            return res.status(400).json({ message: "Employee cannot approve report" })
        }

        const findRowFlocks = await FlocksReport.findByPk(id);

        findRowFlocks.status = approval;
        await findRowFlocks.save();

        if (approval === "approved") {
            const additionalFlocks = findRowFlocks.additional_flocks - (findRowFlocks.deceased_flocks + findRowFlocks.cal)
            // console.log(additionalFlocks)

            const TotalFlocksNumber = await TotalFlocks.findByPk(1)

            const currentFlocksNumber = TotalFlocksNumber.flocks_number
            const currentCageAvailable = TotalFlocksNumber.cage_available

            TotalFlocksNumber.flocks_number = additionalFlocks + currentFlocksNumber
            TotalFlocksNumber.cage_available = currentCageAvailable - additionalFlocks

            if (TotalFlocksNumber.cage_available < 0) {
                return res.status(400).json({ message: "There are no cages available" })
            }

            await TotalFlocksNumber.save()
        }

        res.status(200).json({ message: "Flocks report approved" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

//NEEDS TO BE DONE
router.post("/egg/sales/approved", Authentication, async (req, res) => {
    try {
        const { id, approval } = req.body
        const userRole = req.user.role

        if (userRole === "employee") {
            return res.status(400).json({ message: "Employee cannot approve report" })
        }

        const findRowEggs = await SalesReport.findByPk(id);

        if (approval === "approved") {
            const eggType = findRowEggs.egg_type
            const eggQuantity = findRowEggs.quantity

            const findCurrEggCount = await TotalEggs.findOne({
                where: {
                    egg_type: eggType
                }
            })

            if (findCurrEggCount.dataValues.egg_quantity < eggQuantity) {
                return res.status(400).json({ message: "Insufficient egg counts in the inventory" })
            }
            const updatedCount = findCurrEggCount.dataValues.egg_quantity - eggQuantity

            await TotalEggs.update(
                { egg_quantity: updatedCount },
                {
                    where: {
                        egg_type: eggType
                    }
                }
            );

            const currentDate = new Date();

            const startOfToday = startOfDay(currentDate);
            const endOfToday = endOfDay(currentDate);

            // Find the entry for the current date
            let existingEntry = await SalesProd.findOne({
                where: {
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            });

            console.log(existingEntry)

            if (existingEntry) {
                // If entry exists, update it
                existingEntry.egg_sales += eggQuantity;
                await existingEntry.save();
            } else {
                // If entry doesn't exist, create a new one
                await SalesProd.create({
                    egg_sales: eggQuantity,
                });
            }

            findRowEggs.status = approval;
            await findRowEggs.save()

            await EggCount.create({
                egg_type: eggType,
                egg_before: findCurrEggCount.dataValues.egg_quantity,
                egg_after: updatedCount
            })

        } else {
            findRowEggs.status = approval;
            await findRowEggs.save()
        }

        res.status(200).json({ message: "Status Updated Successfully" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router