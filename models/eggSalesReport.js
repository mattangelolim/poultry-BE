const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesReport = sequelize.define("SalesReport", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    buyer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    egg_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
});

SalesReport.sync()

module.exports = SalesReport;