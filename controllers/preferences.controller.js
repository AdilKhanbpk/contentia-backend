import Preferences from "../models/preferences.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create new content
export const createContent = asyncHandler(async (req, res) => {
  try {
    // Validate request body
    const { contentType, customCheckbox, gender, address } = req.body;

    // You can add additional validation as needed here

    // Create new content instance
    const content = new Preferences({
      contentType,
      customCheckbox,
      gender,
      address,
      // Add other fields as needed
      city: req.body.city || "",
      country: req.body.country || "",
      neighborhood: req.body.neighborhood || "",
      state: req.body.state || "",
    });

    // Save content to the database
    await content.save();
    return res
      .status(201)
      .json({ message: "Content created successfully", content });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error creating content", error: error.message });
  }
});
