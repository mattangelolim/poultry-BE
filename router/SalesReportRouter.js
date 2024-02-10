const express = require("express")
const router = express.Router()
const Authentication = require("../middlewares/AuthMiddleware")
const EggSales = require("../models/eggSalesReport")
const TotalEggs = require("../models/TotalEggs")

router.post("/sales/report", Authentication, async (req, res) => {
    try {
        const { date, buyer_name, egg_type, quantity } = req.body
        const userRole = req.user.role

        if (userRole !== 'employee') {
            res.status(400).json({ message: "Only employee can report sales" })
        }

        const findRowTotalEgg = await TotalEggs.findOne({
            where: {
                egg_type: egg_type
            },
            attributes: ['egg_quantity', 'egg_cost']
        })

        if (findRowTotalEgg.egg_quantity < quantity) {
            res.status(400).json({ message: "Inputted quantity is greater than the inventory quantity" })
        }

        const totalPrice = quantity * findRowTotalEgg.egg_cost

        await EggSales.create({
            date,
            buyer_name,
            egg_type,
            quantity,
            price: totalPrice
        })

        res.json({ message: "Egg Sales Reported Success" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router