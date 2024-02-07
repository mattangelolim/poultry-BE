// models/TotalEggs.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TotalEggs = sequelize.define("TotalEggs", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    egg_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    egg_quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    egg_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
});

// TotalEggs.sync()

// async function createTotalEggData() {
//     try {

//         // Create the superadmin user
//         const eggTotal = await TotalEggs.create({
//             egg_type: "egg_lg",
//             egg_cost: 9
//         });

//         console.log("egg created:", eggTotal);
//     } catch (error) {
//         console.error("Error creating egg:", error);
//     }
// }

// createTotalEggData();
module.exports = TotalEggs;
