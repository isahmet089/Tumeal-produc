const mangoose = require("mongoose");

const userSchema = new mangoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null, // Doğrulama için JWT token saklanacak
    },
  },
  { timestamps: true }
);
module.exports = mangoose.model("User", userSchema);
