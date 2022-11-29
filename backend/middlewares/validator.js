const { check, validationResult } = require("express-validator")

exports.userValidator = [
  check("name").trim().notEmpty().withMessage("Name is required!"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email address!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8 characters long!"),
]

exports.validate = (req, res, next) => {
  const error = validationResult(req).array()
  next()
}
