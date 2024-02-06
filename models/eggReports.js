const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EggReport = sequelize.define("EggReport", {
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
    egg_sm_produced: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    egg_md_produced: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    egg_lg_produced: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rejected: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    }
});

EggReport.sync()

module.exports = EggReport;