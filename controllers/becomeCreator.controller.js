import asyncHandler from "../utils/asyncHandler.js";
import CreatorForm from "../models/becomeCreator.model.js";

// Create or update OrdersProfile
export const addBecomeCreator = asyncHandler(async (req, res) => {
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
  res.status(201).json({
    status: 201,
    message: "Form submitted successfully",
    data: savedCreatorForm,
  });
});
