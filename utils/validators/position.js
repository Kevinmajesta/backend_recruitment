const { body } = require("express-validator");

const validatePosition = [
  body("title").notEmpty().withMessage("Title is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("type").isIn(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).withMessage("Invalid job type"),
  body("description").notEmpty().withMessage("Description is required"),
  body("salary").notEmpty().withMessage("Salary info is required"),
];

module.exports = { validatePosition };