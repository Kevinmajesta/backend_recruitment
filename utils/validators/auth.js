
const { body } = require("express-validator");

const prisma = require("../../prisma/client");

const validateRegister = [
  body("companyName").notEmpty().withMessage("Company name is required"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .custom(async (value) => {
      const user = await prisma.user.findUnique({ where: { email: value } });
      if (user) throw new Error("Email already exists");
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password min 6 characters"),
  body("phone").notEmpty().withMessage("Phone number is required"),
];


const validateLogin = [
  body("email").notEmpty().withMessage("Email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = { validateRegister, validateLogin };
