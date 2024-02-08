// models/TotalFlocks.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TotalFlocks = sequelize.define("TotalFlocks", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    flocks_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cage_available: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

// TotalFlocks.sync()

// async function createTotalFlocksData() {
//     try {

//         // Create the superadmin user
//         const flocks = await TotalFlocks.create({
//             flocks_number: 0,
//             cage_available: 200
//         });

//         console.log("flocks created:", flocks);
//     } catch (error) {
//         console.error("Error creating flocks:", error);
//     }
// }

// createTotalFlocksData();
module.exports = TotalFlocks;
