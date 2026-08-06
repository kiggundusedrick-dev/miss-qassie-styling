console.log("PASSWORD ROUTES LOADED");

const express = require("express");

const router = express.Router();

const passwordController =
require("../controllers/passwordController");

console.log(passwordController);

router.post(
    "/forgot-password",
    passwordController.forgotPassword
);

router.post(
    "/reset-password",
    passwordController.resetPassword
);

module.exports = router;