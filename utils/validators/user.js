const { body } = require("express-validator");
const prisma = require("../../prisma/client/index");

const validateUser = [
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
  body("role").isIn(["ADMIN", "RECRUITER"]).withMessage("Invalid role"),
];

module.exports = { validateUser };
