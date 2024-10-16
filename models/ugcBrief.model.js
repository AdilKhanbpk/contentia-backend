// models/ugcBriefModel/ugcBriefModel.js
const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    brand: { type: String, required: false },
    brief: { type: String, maxLength: 1000 },
    productName: { type: String, required: true },
    scenario: String,
    description: String,
    sampleWork: String,
    country: String,
    website: String,
    category: String,
    files: { type: String }, // Add file field to store the file path or name
}, { timestamps: true });

module.exports = mongoose.model('UgcBrief', FormSchema);