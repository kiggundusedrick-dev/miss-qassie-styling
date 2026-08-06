require("dotenv").config();

console.log(process.env.DATABASE_URL);

const bcrypt = require("bcrypt");
const pool = require("./db");

async function createAdmin() {

    try {

        const fullName = "Miss Qassie Administrator";
const email = "missqassiestyling@gmail.com";
const plainPassword = "123456";

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        await pool.query(

            `INSERT INTO admins
            (full_name, email, password_hash)
            VALUES ($1, $2, $3)`,

            [fullName, email, hashedPassword]

        );

        console.log("✅ Admin account created successfully.");

    } catch (err) {

        console.error(err);

    } finally {

        await pool.end();

    }

}

createAdmin();