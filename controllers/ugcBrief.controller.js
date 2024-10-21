import Form from "../models/ugcBrief.model.js"; // Adjust the path as necessary
import asyncHandler from "../utils/asyncHandler.js";

// Create a new form
export const createForm = asyncHandler(async (req, res) => {
  try {
    const {
      brand,
      brief,
      productName,
      scenario,
      description,
      sampleWork,
      category,
      website,
      country,
    } = req.body;
    const file = req.file ? req.file.path : null;

    const newForm = new Form({
      brand,
      brief,
      productName,
      scenario,
      description,
      sampleWork,
      category,
      website,
      country,
      files: file,
    });

    const savedForm = await newForm.save();
    res
      .status(201)
      .json({ message: "Form created successfully", data: savedForm });
  } catch (error) {
    console.error("Error creating form:", error);
    res
      .status(500)
      .json({ message: "Error creating form", error: error.message });
  }
});

// Get all forms
export const getAllForms = asyncHandler(async (req, res) => {
  try {
    const forms = await Form.find();
    res
      .status(200)
      .json({ message: "Forms fetched successfully", data: forms });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res
      .status(500)
      .json({ message: "Error fetching forms", error: error.message });
  }
});

// Get a specific form by ID
export const getFormById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ message: "Form fetched successfully", data: form });
  } catch (error) {
    console.error("Error fetching form:", error);
    res
      .status(500)
      .json({ message: "Error fetching form", error: error.message });
  }
});

// Update an existing form
export const updateForm = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand,
      brief,
      productName,
      scenario,
      description,
      sampleWork,
      category,
      website,
      country,
    } = req.body;
    const file = req.file ? req.file.path : null;

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      {
        brand,
        brief,
        productName,
        scenario,
        description,
        sampleWork,
        category,
        website,
        country,
        files: file,
      },
      { new: true } // Returns the updated form
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res
      .status(200)
      .json({ message: "Form updated successfully", data: updatedForm });
  } catch (error) {
    console.error("Error updating form:", error);
    res
      .status(500)
      .json({ message: "Error updating form", error: error.message });
  }
});

// Delete a form by ID
export const deleteForm = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res
      .status(200)
      .json({ message: "Form deleted successfully", data: deletedForm });
  } catch (error) {
    console.error("Error deleting form:", error);
    res
      .status(500)
      .json({ message: "Error deleting form", error: error.message });
  }
});
