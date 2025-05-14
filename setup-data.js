import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE || "mongodb://localhost:27017/contentia", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");
    
    try {
      // Import models
      const User = mongoose.model("User") || 
        mongoose.model("User", new mongoose.Schema({
          email: String,
          password: String,
          firstName: String,
          lastName: String,
          role: String,
          authProvider: String,
          status: String
        }));
      
      const AdditionalServiceModel = mongoose.model("additionalService") || 
        mongoose.model("additionalService", new mongoose.Schema({
          editPrice: Number,
          sharePrice: Number,
          coverPicPrice: Number,
          creatorTypePrice: Number,
          shippingPrice: Number,
          thirtySecondDurationPrice: Number,
          sixtySecondDurationPrice: Number
        }));
      
      // 1. Create admin user if it doesn't exist
      const existingAdmin = await User.findOne({ email: "admin@contentia.com" });
      
      if (!existingAdmin) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@123", salt);
        
        // Create admin user
        const adminUser = await User.create({
          email: "admin@contentia.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          authProvider: "credentials",
          status: "approved"
        });
        
        console.log("Admin user created:", adminUser.email);
      } else {
        console.log("Admin user already exists:", existingAdmin.email);
      }
      
      // 2. Create additional services if they don't exist
      const existingServices = await AdditionalServiceModel.findOne({});
      
      if (!existingServices) {
        // Create additional services with default prices
        const additionalServices = await AdditionalServiceModel.create({
          editPrice: 50,                  // Price for editing service
          sharePrice: 30,                 // Price for sharing service
          coverPicPrice: 20,              // Price for cover picture
          creatorTypePrice: 100,          // Price for creator type
          shippingPrice: 25,              // Price for shipping
          thirtySecondDurationPrice: 75,  // Price for 30-second videos
          sixtySecondDurationPrice: 150   // Price for 60-second videos
        });
        
        console.log("Additional services created with default prices");
      } else {
        console.log("Additional services already exist");
      }
      
      console.log("Setup completed successfully!");
    } catch (error) {
      console.error("Error during setup:", error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
