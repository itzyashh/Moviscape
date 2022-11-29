const user = require("../models/user")
const bcrypt = require("bcrypt")
exports.create = async (req, res) => {
  const { name, email, password } = req.body

  const oldUser = await user.findOne({ email })
  if (oldUser)
    return res.status(401).json({ error: "Email already registered!" })
  bcrypt.hash(password, 8, function (err, hash) {
    const newUser = new user({ name, email, password: hash })
    newUser.save()
    return res.status(200).json({ success: { name, email, password: hash } })
  })
}
