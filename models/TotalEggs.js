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
    egg_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
});

TotalEggs.sync()
module.exports = TotalEggs;
