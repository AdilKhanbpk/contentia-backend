// controllers/ugcBriefController/ugcBriefController.js
const Form = require('../../models/ugcBriefModel/ugcBriefModel'); // Adjust the path as necessary

// Controller function to handle form submission
const submitForm = async (req, res) => {
    try {
        // Log the request body and file for debugging
        console.log('Received body:', req.body);
        console.log('Received file:', req.file);

        const { brand, brief, productName, scenario, description, sampleWork } = req.body;
        const file = req.file ? req.file.path : null; // Get the file path from multer

        const newForm = new Form({
            brand,
            brief,
            productName,
            scenario,
            description,
            sampleWork,
            files: file, // Save the file path, using 'files' to match the model
        });

        const savedForm = await newForm.save();
        res.status(201).json(savedForm); // Respond with the saved form data
    } catch (error) {
        console.error('Error saving the form:', error); // Log the full error object
        res.status(500).json({ message: 'Error saving the form.', error: error });
    }
};

module.exports = {
    submitForm,
};
