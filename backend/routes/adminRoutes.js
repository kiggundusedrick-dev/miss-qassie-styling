const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const authenticateAdmin = require("../middleware/authenticateAdmin");

// ===================================
// ADMIN LOGIN
// ===================================

router.post("/login", adminController.login);

module.exports = router;