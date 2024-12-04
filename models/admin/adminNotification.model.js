import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
    },
    users: {
      type: [mongoose.Types.ObjectId],
      refPath: "userRefPath",
    },
    userRefPath: {
      type: String,
      enum: ["user", "creator"],
    },
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
