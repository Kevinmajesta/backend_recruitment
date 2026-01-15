const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { validateLogin } = require("../utils/validators/auth");
const { validateRegister } = require("../utils/validators/auth");

const verifyToken = require("../middlewares/auth");

router.post("/auth/register", validateRegister, authController.register);
router.post("/auth/login", validateLogin, authController.login);
router.get("/auth/me", verifyToken, authController.me);
router.post("/auth/logout", verifyToken, authController.logout);

module.exports = router;
