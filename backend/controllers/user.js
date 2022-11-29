const User = require("../models/user")
const EmailVerificationToken = require("../models/emailVerificationToken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const { isValidObjectId } = require("mongoose")
const { generateOTP, generateMailTransporter } = require("../utils/mail")
const { sendError } = require("../utils/helper")

exports.create = async (req, res) => {
  const { name, email, password } = req.body

  const oldUser = await User.findOne({ email })
  if (oldUser) return sendError(res, "Email already registered!")

  const newUser = new User({ name, email, password })
  await newUser.save()

  let OTP = generateOTP()

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()
  var transport = generateMailTransporter()
  transport.sendMail({
    from: "moviscape@server.com",
    to: newUser.email,
    subject: "Verification",
    html: `
    <p>Your OTP is </p>
    <h1>${OTP}</h1>
    `,
  })

  return res.status(200).json({ success: "Please check your email" })
}

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body
  if (!isValidObjectId(userId))
    return res.status(401).json({ error: "Invalid user" })

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: "user not found" })

  if (user.isVerified)
    return res.status(401).json({ error: "user is already verified" })

  const token = await EmailVerificationToken.findOne({ owner: userId })
  if (!token) return res.status(404).json({ error: "token not found" })

  const isMatched = await token.compareToken(OTP)
  if (!isMatched)
    return res.status(401).json({ error: "Please submit a valid OTP" })

  user.isVerified = true
  await user.save()

  await EmailVerificationToken.findByIdAndDelete(token._id)
  var transport = generateMailTransporter()
  transport.sendMail({
    from: "moviscape@server.com",
    to: user.email,
    subject: "Welcome to Moviscape",
    html: `
    <p>Your OTP is </p>
    <h1>Welcome to Moviscape ${user.name}</h1>
    `,
  })
  res.json({ success: "Your email is veriifed" })
}
exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body

  const user = await User.findById(userId)
  if (!user) return res.status(404).json({ error: "user not found" })
  if (user.isVerified)
    return res.status(401).json({ error: "Email is already verified" })

  const tokenIsPresent = await EmailVerificationToken.findOne({ owner: userId })
  if (tokenIsPresent)
    return res.status(401).json({
      error: "Only one OTP can be requested within an hour.Please wait!",
    })

  let OTP = generateOTP()

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()
  var transport = generateMailTransporter()
  transport.sendMail({
    from: "moviscape@server.com",
    to: user.email,
    subject: "Verification",
    html: `
    <p>Your OTP is </p>
    <h1>${OTP}</h1>
    `,
  })

  return res.status(200).json({ success: "Please check your email" })
}
