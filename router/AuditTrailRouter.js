const express = require("express")
const router = express.Router()
const Audit = require("../models/audit")

router.post("/save/audit", async (req, res) => {
    try {
        const { role, username, action, type } = req.query

        const saveAudit = await Audit.create({
            role,
            username,
            action,
            type
        })

        res.status(200).json({ saveAudit })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/get/audit", async (req, res) => {
    try {
        const getAudits = await Audit.findAll()

        const formattedAudits = getAudits.map(audit => {
            const createdAt = new Date(audit.createdAt);
            const updatedAt = new Date(audit.updatedAt);

            // Add 8 hours to each timestamp
            createdAt.setHours(createdAt.getHours() + 8);
            updatedAt.setHours(updatedAt.getHours() + 8);

            const formattedCreatedAt = createdAt.toLocaleString('en-US', { timeZone: 'UTC' });
            const formattedUpdatedAt = updatedAt.toLocaleString('en-US', { timeZone: 'UTC' });

            return {
                ...audit.toJSON(),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            };
        });
        
        res.status(200).json({ getAudits: formattedAudits });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})
module.exports = router