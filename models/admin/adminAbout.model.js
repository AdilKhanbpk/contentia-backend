const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aboutSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AboutModel =
  mongoose.models.About || mongoose.model("About", aboutSchema);

module.exports = AboutModel;
