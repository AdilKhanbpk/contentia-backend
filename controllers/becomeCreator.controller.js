const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const CreatorForm = require('../models/becomeCreator.model');

// Create or update OrdersProfile
exports.addBecomeCreator = catchAsync(async (req, res) => {
    try {
        // Validate incoming data (this can be expanded with more validation)
        const {
            profile_information,
            payment_information,
            billing_information,
            content_information,
            social_information,
        } = req.body;

        // Create a new document based on the model
        const creatorForm = new CreatorForm({
            profile_information,
            payment_information,
            billing_information,
            content_information,
            social_information,
        });

        // Save the document to the database
        const savedCreatorForm = await creatorForm.save();
        res.status(201).json({ status: 201, message: 'Form submitted successfully', data: savedCreatorForm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }

})
