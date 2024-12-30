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
        videos: {
            type: [String], // This allows multiple videos to be stored in an array
            validate: [arrayLimit, "{PATH} exceeds the limit of 10 videos"],
        },
    },
    {
        timestamps: true,
    }
);

// Custom validator to limit the number of videos to 10
function arrayLimit(val) {
    return val.length <= 10;
}

const LandingPageModel =
    mongoose.models.LandingPage ||
    mongoose.model("LandingPage", landingPageSchema);

export default LandingPageModel;
