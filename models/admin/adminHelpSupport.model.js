const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSupportSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const HelpSupportModel =
  mongoose.models.helpSupportModel ||
  mongoose.model("helpSupportModel", helpSupportSchema);

module.exports = HelpSupportModel;
