import User from "../models/user.model.js";
import OrdersProfile from "../models/ordersProfile.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

// Create or update OrdersProfile
export const updateOrdersProfile = asyncHandler(async (req, res) => {
  const { ordersProfileData } = req.body;
  console.log("ordersprofiledata from the backend: ", ordersProfileData);

  // Ensure ordersProfileData is provided
  if (!ordersProfileData) {
    return res
      .status(400)
      .json({ success: false, message: "OrdersProfile data is required." });
  }

  // Ensure an _id is provided for existing OrdersProfile
  if (!ordersProfileData._id) {
    return res
      .status(400)
      .json({ success: false, message: "OrdersProfile ID is required." });
  }

  // Attempt to find an existing OrdersProfile
  let ordersProfile = await OrdersProfile.findById(ordersProfileData._id);

  if (!ordersProfile) {
    // If no profile exists, create a new one
    ordersProfile = new OrdersProfile(ordersProfileData);
    await ordersProfile.save();
  } else {
    // If a profile exists, update it using Object.assign
    Object.assign(ordersProfile, ordersProfileData);
    await ordersProfile.save(); // Save the updated profile
  }

  // Check if email or password is being updated in the OrdersProfile data
  const { email, newPassword } = ordersProfileData;
  const updates = {};

  if (email) updates.email = email; // Update user's email if provided
  if (newPassword) {
    const salt = await bcrypt.genSalt(12); // Generate salt for hashing
    updates.password = await bcrypt.hash(newPassword, salt); // Hash new password
  }

  // Update user's email and password if they're included in ordersProfileData
  if (Object.keys(updates).length > 0) {
    await User.updateOne({ _id: req.user.id }, updates);
  }

  // Update user's ordersProfile reference (if it was created or updated)
  await User.updateOne(
    { _id: req.user.id },
    { ordersProfile: ordersProfile._id }
  );

  res.status(200).json({ success: true, data: ordersProfile }); // Return updated profile data
});

// Fetch the currently authenticated user along with OrdersProfile
export const getUserWithProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Use the ID from the authenticated user

  // Fetch user by ID and populate their ordersProfile
  const user = await User.findById(userId).populate("ordersProfile");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, data: user });
});
