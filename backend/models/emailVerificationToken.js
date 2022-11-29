const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const emailVerificationTokenSchema = mongoose.Schema({
  owner: {
    type: mongoose.SchemaTypes.ObjectId, // mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 1800,
    default: Date.now(),
  },
})

emailVerificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 5)
  }
  next()
})

emailVerificationTokenSchema.methods.compareToken = async function (token) {
  const result = await bcrypt.compare(token, this.token)
  return result
}

module.exports = mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema
)
