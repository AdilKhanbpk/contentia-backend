// models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    contentType: { type: String, required: false },
    customCheckbox: { type: [String], required: false }, // Array of strings
    gender: { type: String, required: false },
    address: { type: String, required: false },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    neighborhood: { type: String, default: '' },
    state: { type: String, default: '' },
}, { timestamps: true });

const Content = mongoose.model('Preferences', contentSchema);