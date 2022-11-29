const User = require("../models/user")
const EmailVerificationToken = require("../models/emailVerificationToken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const { isValidObjectId } = require("mongoose")

exports.create = async (req, res) => {
  const { name, email, password } = req.body

  const oldUser = await User.findOne({ email })
  if (oldUser)
    return res.status(401).json({ error: "Email already registered!" })

  const newUser = new User({ name, email, password })
  await newUser.save()
  function generateOTP() {
    // Declare a digits variable
    // which stores all digits
    var digits = "0123456789"
    let OTP = ""
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)]
    }
    return OTP
  }

  let OTP = generateOTP()

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d850847dd66891",
      pass: "5f4b4277e9afac",
    },
  })
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
  if (!user) return res.status(401).json({ error: "user not found" })

  if (user.isVerified)
    return res.status(401).json({ error: "user is already verified" })

  const token = await EmailVerificationToken.findOne({ owner: userId })
  if (!token) return res.status(401).json({ error: "token not found" })

  const isMatched = await token.compareToken(OTP)
  if (!isMatched)
    return res.status(401).json({ error: "Please submit a valid OTP" })

  user.isVerified = true
  await user.save()

  await EmailVerificationToken.findByIdAndDelete(token._id)
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d850847dd66891",
      pass: "5f4b4277e9afac",
    },
  })
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
  if (!user) return res.status(401).json({ error: "user not found" })
  if (user.isVerified)
    return res.status(401).json({ error: "Email is already verified" })

  const tokenIsPresent = await EmailVerificationToken.findOne({ owner: userId })
  if (tokenIsPresent)
    return res.status(401).json({
      error: "Only one OTP can be requested within an hour.Please wait!",
    })
  function generateOTP() {
    // Declare a digits variable
    // which stores all digits
    var digits = "0123456789"
    let OTP = ""
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)]
    }
    return OTP
  }
  let OTP = generateOTP()

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  })

  await newEmailVerificationToken.save()
  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d850847dd66891",
      pass: "5f4b4277e9afac",
    },
  })
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
