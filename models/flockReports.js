// models/FlocksReport.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FlocksReport = sequelize.define("FlocksReport", {
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
    additional_flocks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deceased_flocks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sick_flocks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cal: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    flocks_number_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    flocks_number_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    }
});

// FlocksReport.sync()


module.exports = FlocksReport;
