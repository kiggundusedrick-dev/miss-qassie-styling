const adminService = require("../services/adminService");

async function login(req, res) {

    console.log("BODY RECEIVED:", req.body);
console.log("EMAIL:", req.body.email);

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }

        const loginResult = await adminService.loginAdmin(email, password);

        if (!loginResult) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            token: loginResult.token,

            admin: loginResult.admin

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

}

module.exports = {

    login

};