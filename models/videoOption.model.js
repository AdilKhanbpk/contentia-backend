import mongoose from "mongoose";

const videoOptionSchema = new mongoose.Schema({
  duration: {
    type: String,
    required: true,
  },
  edit: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  ratio: {
    type: String,
    required: true,
  },
  selectedCard: {
    type: Number,
    required: true,
  },
  selectedQuantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
});

const VideoOption = mongoose.model("VideoOption", videoOptionSchema);
export default VideoOption;
