exports.create = (req, res) => {
  const { name, email, password } = req.body
  console.log(name)
  res.status(200).json({ name: `${name}` })
}
