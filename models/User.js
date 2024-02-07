// models/Admin.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt")

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

// User.sync()

// async function createSuperAdmin() {
//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash("password123", 10);

//         // Create the superadmin user
//         const superAdmin = await User.create({
//             name: "Super Admin",
//             email: "superadmin@email.com",
//             role: "superadmin",
//             username: "superadmin",
//             password: hashedPassword,
//         });

//         console.log("Superadmin created:", superAdmin);
//     } catch (error) {
//         console.error("Error creating superadmin:", error);
//     }
// }

// createSuperAdmin();
module.exports = User;
