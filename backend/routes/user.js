const express = require("express")
const { check } = require("express-validator")
const {
  create: createUser,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
} = require("../controllers/user")
const { userValidator, validate } = require("../middlewares/validator")
const router = express.Router()

router.post("/create", userValidator, validate, createUser)
router.post("/verifyEmail", verifyEmail)
router.post("/resendVerifyEmail", resendEmailVerificationToken)
router.post("/forgetPassword", forgetPassword)

module.exports = router
