const nodemailer = require("nodemailer")
exports.generateOTP = (length = 6) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789"
  let OTP = ""
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }
  return OTP
}
exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d850847dd66891",
      pass: "5f4b4277e9afac",
    },
  })
