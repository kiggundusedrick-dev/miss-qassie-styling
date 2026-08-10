const jwt = require("jsonwebtoken");

function authenticateAdmin(req, res, next) {

    console.log("========== AUTHENTICATE ADMIN ==========");
    console.log("Authorization header exists:",
        !!req.headers.authorization
    );

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        console.log("AUTH ERROR: No Authorization header");

        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });

    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {

        console.log("AUTH ERROR: Invalid Authorization format");

        return res.status(401).json({
            success: false,
            message: "Invalid authentication format."
        });

    }

    const token = parts[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("TOKEN VERIFIED SUCCESSFULLY");
        console.log("ADMIN ID:", decoded.id);
        console.log("ADMIN EMAIL:", decoded.email);
        console.log("ADMIN ROLE:", decoded.role);

        req.admin = decoded;

        next();

    } catch (err) {

        console.error("========== JWT ERROR ==========");
        console.error("JWT ERROR NAME:", err.name);
        console.error("JWT ERROR MESSAGE:", err.message);
        console.error("================================");

        return res.status(401).json({
            success: false,
            message: "Token expired or invalid."
        });

    }

}

module.exports = authenticateAdmin;