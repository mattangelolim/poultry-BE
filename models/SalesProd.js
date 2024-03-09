// models/FlocksReport.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesProd = sequelize.define("SalesProd", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    egg_prod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    egg_reject:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    egg_sales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    }
});

// SalesProd.sync()


module.exports = SalesProd;
