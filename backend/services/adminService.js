const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function loginAdmin(email, password) {

    const result = await pool.query(

        `SELECT * FROM admins WHERE email = $1`,

        [email]

    );

    if (result.rows.length === 0) {

        return null;

    }

    const admin = result.rows[0];

    const passwordMatches = await bcrypt.compare(

        password,

        admin.password_hash

    );

    if (!passwordMatches) {

        return null;

    }

    // ==========================
    // CREATE JWT TOKEN
    // ==========================

    const token = jwt.sign(

        {

            id: admin.id,
            email: admin.email,
            role: admin.role

        },

        process.env.JWT_SECRET,

        {

            expiresIn: process.env.JWT_EXPIRES_IN

        }

    );

    return {

        token,

        admin: {

            id: admin.id,
            full_name: admin.full_name,
            email: admin.email,
            role: admin.role

        }

    };

}

module.exports = {

    loginAdmin

};