import mongoose from "mongoose";
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "user"], // Corrected enum declaration
      default: "user",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
      // validate: {
      //     validator: function (value) {
      //         // Simple regex for phone number validation
      //         const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      //         return phoneRegex.test(value);
      //     },
      //     message: 'Invalid phone number format.'
      // }
    },
    smsOTP: {
      type: String,
      // validate: {
      //     validator: function (value) {
      //         // Optional: add validation for SMS OTP format (e.g., 6-digit number)
      //         const otpRegex = /^\d{6}$/; // Adjust as needed
      //         return !value || otpRegex.test(value);
      //     },
      //     message: 'Invalid SMS OTP format. Must be a 6-digit number.'
      // }
    },
    age: {
      type: Number,
      required: [true, "Age is required."],
    },
    customerStatus: {
      type: String,
      enum: {
        values: ["approved", "waiting"],
        message: 'Invalid customer status. Must be "approved" or "waiting".',
      },
      default: "waiting",
    },
    invoice: {
      type: {
        type: String,
        enum: {
          values: ["Individual", "Corporate"],
          message: 'Invalid invoice type. Must be "Individual" or "Corporate".',
        },
        required: [true, "Invoice type is required."],
      },
      individual: {
        invoiceFullName: {
          type: String,
          required: function () {
            return this.invoice.type === "Individual";
          },
          message: "Full name is required for Individual invoice.",
        },
        invoiceIdentityNumber: { type: String },
        invoiceAddress: { type: String },
      },
      corporate: {
        companyName: {
          type: String,
          required: function () {
            return this.invoice.type === "Corporate";
          },
          message: "Company name is required for Corporate invoice.",
        },
        taxNumber: { type: String },
        taxOffice: { type: String },
        invoiceAddress: { type: String },
      },
    },
    termsAndConditionsApproved: {
      type: Boolean,
      required: [true, "Terms and conditions must be approved."],
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: "You must approve the terms and conditions.",
      },
    },
    termsAndConditionsDate: {
      type: Date,
      default: Date.now,
    },
    communication: {
      type: Boolean,
      required: [true, "Communication must be approved."],
    },
    communicationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.pre("save", function (next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (this.email === adminEmail) {
    this.role = "admin";
  }

  next();
});

const CustomerUserModel =
  mongoose.models.customerUserModel ||
  mongoose.model("customer", customerSchema);

export default CustomerUserModel;
