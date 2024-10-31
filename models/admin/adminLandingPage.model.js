import mongoose from "mongoose";
const Schema = mongoose.Schema;

const landingPageSchema = new Schema(
  {
    carouselHeroTitle: {
      type: String,
      required: true,
      trim: true,
    },
    staticHeroTitle: {
      type: String,
      required: true,
      trim: true,
    },
    heroSubTitle: {
      type: String,
      required: true,
      trim: true,
    },
    videoOne: {
      type: String,
    },
    videoTwo: {
      type: String,
    },
    videoThree: {
      type: String,
    },
    videoFour: {
      type: String,
    },
    videoFive: {
      type: String,
    },
    videoSix: {
      type: String,
    },
    videoSeven: {
      type: String,
    },
    videoEight: {
      type: String,
    },
    videoNine: {
      type: String,
    },
    videoTen: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LandingPageModel =
  mongoose.models.LandingPage ||
  mongoose.model("LandingPage", landingPageSchema);

export default LandingPageModel;
