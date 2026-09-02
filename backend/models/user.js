const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    fullBodyImage: {
      url: {
        type: String,
        default: null
      },

      publicId: {
        type: String,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "User",
    userSchema
  );