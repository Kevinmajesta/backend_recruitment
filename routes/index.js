const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");
const userController = require("../controllers/UserController");
const positionController = require("../controllers/PositionController");
const applicantController = require("../controllers/ApplicantController");

const { validateUser } = require("../utils/validators/user");
const { validateLogin, validateRegister } = require("../utils/validators/auth");
const { validatePosition } = require("../utils/validators/position");
const { validateApplicant, validateStatus, validateNotes } = require("../utils/validators/applicant");

const verifyToken = require("../middlewares/auth");
const authorize = require("../middlewares/rbac");

// auth 
router.post("/auth/register", validateRegister, authController.register);
router.post("/auth/login", validateLogin, authController.login);
router.get("/auth/me", verifyToken, authController.me);
router.post("/auth/logout", verifyToken, authController.logout);

// user
router.post("/users", verifyToken, authorize(["ADMIN"]), validateUser, userController.createUser);
router.delete("/users/:id", verifyToken, authorize(["ADMIN"]), userController.deleteUser);
router.get("/users", verifyToken, userController.getUsers);
router.get("/users/:id", verifyToken, userController.getUserById);

//position
router.post("/positions", verifyToken, authorize(["ADMIN", "RECRUITER"]), validatePosition, positionController.createPosition);
router.get("/positions", verifyToken, authorize(["ADMIN", "RECRUITER"]), positionController.getPositions);
router.get("/positions/:id", verifyToken, authorize(["ADMIN", "RECRUITER"]), positionController.getPositionById);
router.put("/positions/:id", verifyToken, authorize(["ADMIN", "RECRUITER"]), validatePosition, positionController.updatePosition);
router.delete("/positions/:id", verifyToken, authorize(["ADMIN", "RECRUITER"]), positionController.deletePosition);

//applicant
// public
router.post("/applicants", validateApplicant, applicantController.apply);
//private
router.get("/applicants", verifyToken, applicantController.getApplicants);
router.get("/applicants/:id", verifyToken, applicantController.getApplicantById);
router.patch("/applicants/:id/status", verifyToken, validateStatus, applicantController.updateStatus);
router.patch("/applicants/:id/notes", verifyToken, validateNotes, applicantController.updateNotes);
router.delete("/applicants/:id", verifyToken, applicantController.deleteApplicant);

module.exports = router;