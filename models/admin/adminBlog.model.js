import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blogPostSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["published", "waiting"],
      default: "published",
    },
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
    bannerImage: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    metaKeywords: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const blogModel =
  mongoose.models.blogModel || mongoose.model("blog", blogPostSchema);

export default blogModel;
