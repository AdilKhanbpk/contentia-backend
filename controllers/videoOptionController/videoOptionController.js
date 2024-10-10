// controllers/videoOptionsController.js
const VideoOption = require('../../models/videoOptionModel/videoOptionModel');

// Controller function to create a new video option
const createVideoOption = async (req, res) => {
  try {
    const { duration, edit, platform, ratio, selectedCard, selectedQuantity, totalPrice } = req.body;

    const newVideoOption = new VideoOption({
      duration,
      edit,
      platform,
      ratio,
      selectedCard,
      selectedQuantity,
      totalPrice,
    });

    await newVideoOption.save();
    return res.status(201).json({ message: 'Video option created successfully!', newVideoOption });
  } catch (error) {
    console.error('Error creating video option:', error);
    return res.status(500).json({ message: 'Error creating video option', error });
  }
};

module.exports = {
  createVideoOption,
};
