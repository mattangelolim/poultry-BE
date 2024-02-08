const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EggCount = sequelize.define("EggCount", {
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
    egg_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    egg_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

// EggCount.sync()

module.exports = EggCount;