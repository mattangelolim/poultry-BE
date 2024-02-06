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

TotalFlocks.sync()
module.exports = TotalFlocks;
