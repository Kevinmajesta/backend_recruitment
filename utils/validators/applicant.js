const { body } = require("express-validator");

const validateApplicant = [
  body("positionId").isUUID().withMessage("Invalid position ID"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Email is invalid"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("education").notEmpty().withMessage("Education is required"),
  body("experience").isNumeric().withMessage("Experience must be a number"),
  body("resumeUrl").isURL().withMessage("Resume URL must be a valid link"),
];

const validateStatus = [
  body("status").isIn(["PENDING", "REVIEWED", "INTERVIEW", "HIRED", "REJECTED"]).withMessage("Invalid status"),
];

const validateNotes = [
  body("notes").notEmpty().withMessage("Notes cannot be empty"),
];

module.exports = { validateApplicant, validateStatus, validateNotes };