const mongoose = require("mongoose")

mongoose
  .connect("mongodb://localhost:27017/moviewscape")
  .then(() => console.log("MongoDB Connected!!"))
  .catch(err => console.log("MongoDB connection failed"))
