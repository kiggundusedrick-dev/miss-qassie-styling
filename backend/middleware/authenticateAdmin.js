const jwt = require("jsonwebtoken");

function authenticateAdmin(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            success: false,
            message: "Access denied. No token provided."

        });

    }

    const token = authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({

            success: false,
            message: "Invalid authentication token."

        });

    }

    try {

        const decoded = jwt.verify(

            token,
            process.env.JWT_SECRET

        );

        req.admin = decoded;

        next();

    } catch (err) {

        return res.status(401).json({

            success: false,
            message: "Token expired or invalid."

        });

    }

}

module.exports = authenticateAdmin;