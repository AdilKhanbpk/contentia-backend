import mongoose from "mongoose";
const Schema = mongoose.Schema;

const creatorSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "user"],
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
          // Simple regex for email validation
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
      required: [true, "SMS OTP is required."],
      // validate: {
      //     validator: function (value) {
      //         // Optional: add validation for SMS OTP format (e.g., 6-digit number)
      //         const otpRegex = /^\d{6}$/; // Adjust as needed
      //         return otpRegex.test(value);
      //     },
      //     message: 'Invalid SMS OTP format. Must be a 6-digit number.'
      // }
    },
    creatorStatus: {
      type: String,
      enum: {
        values: ["Approved", "Pending", "Rejected", "Banned"],
        message:
          'Invalid creator status. Must be "Approved", "Pending", "Rejected", or "Banned".',
      },
      default: "Pending",
    },
    creatorType: {
      type: String,
      enum: {
        values: ["Micro", "Mega"],
        message: 'Invalid creator type. Must be "Micro" or "Mega".',
      },
      default: "Micro",
    },
    identityNumber: {
      type: String,
      // validate: {
      //     validator: function (value) {
      //         // Optional: Add custom validation if needed
      //         return !value || value.length >= 5; // Example validation
      //     },
      //     message: 'Identity number must be at least 5 characters long.'
      // }
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required."],
      validate: {
        validator: function (value) {
          // Ensure the date of birth is not in the future
          return value < Date.now();
        },
        message: "Date of birth must be in the past.",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["Woman", "Man", "Other"],
        message: 'Invalid gender. Must be "Woman", "Man", or "Other".',
      },
    },
    paymentInformation: {
      bankAccount: {
        type: String,
        enum: {
          values: ["Individual", "Corporate"],
          message:
            'Invalid bank account type. Must be "Individual" or "Corporate".',
        },
        required: [true, "Bank account type is required."],
      },
      individual: {
        bankFullName: {
          type: String,
          required: function () {
            return this.paymentInformation.bankAccount === "Individual";
          },
          message: "Full name is required for Individual bank account.",
        },
        iban: {
          type: String,
          // validate: {
          //     validator: function (value) {
          //         const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
          //         return !value || ibanRegex.test(value);
          //     },
          //     message: 'Invalid IBAN format.'
          // }
        },
        address: {
          type: String,
        },
      },
      corporate: {
        companyName: {
          type: String,
          required: function () {
            return this.paymentInformation.bankAccount === "Corporate";
          },
          message: "Company name is required for Corporate bank account.",
        },
        taxNumber: { type: String },
        taxOffice: { type: String },
        iban: {
          type: String,
          // validate: {
          //     validator: function (value) {
          //         const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
          //         return !value || ibanRegex.test(value);
          //     },
          //     message: 'Invalid IBAN format.'
          // }
        },
        address: {
          type: String,
        },
      },
    },
    invoiceCreator: {
      hasInvoice: {
        type: Boolean,
      },
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
        },
        invoiceIdentityNumber: { type: String },
        invoiceAddress: { type: String },
      },
      corporate: {
        companyName: {
          type: String,
        },
        taxNumber: { type: String },
        taxOffice: { type: String },
        invoiceAddress: { type: String },
      },
    },
    creatorPreferences: {
      contentType: {
        type: String,
        enum: {
          values: ["Product", "Service", "Location"],
          message:
            'Invalid content type. Must be "Product", "Service", or "Location".',
        },
        required: [true, "Content type is required."],
      },
      locationAddress: {
        country: { type: String },
        city: { type: String },
        district: { type: String },
        street: { type: String },
        fullAddress: { type: String },
      },
      contentFormats: [
        {
          type: String,
        },
      ],
      interests: [
        {
          type: String,
        },
      ],
    },
    socialMedia: {
      instagram: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message: "Instagram username must be at least 3 characters long.",
          },
        },
      },
      tiktok: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message: "TikTok username must be at least 3 characters long.",
          },
        },
      },
      facebook: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message: "Facebook username must be at least 3 characters long.",
          },
        },
      },
      youtube: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message: "YouTube username must be at least 3 characters long.",
          },
        },
      },
      x: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message:
              "X (formerly Twitter) username must be at least 3 characters long.",
          },
        },
      },
      linkedin: {
        followers: { type: Number },
        username: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || value.length >= 3; // Example: username must be at least 3 characters long
            },
            message: "LinkedIn username must be at least 3 characters long.",
          },
        },
      },
      portfolioURL: {
        type: String,
        validate: {
          validator: function (value) {
            // Optional: Add URL format validation
            const urlRegex =
              /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
            return !value || urlRegex.test(value);
          },
          message: "Invalid portfolio URL format.",
        },
      },
    },
    termsAndConditionsApproved: {
      type: Boolean,
      required: [true, "Terms and conditions must be approved."],
    },
    termsAndConditionsDate: {
      type: Date,
      default: Date.now,
    },
    communication: {
      type: Boolean,
      required: [true, "Communication preference is required."],
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

creatorSchema.pre("save", function (next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (this.email === adminEmail) {
    this.role = "admin";
  }

  next();
});

const CreatorUserModel =
  mongoose.models.creatorUserModel || mongoose.model("creator", creatorSchema);

export default CreatorUserModel;
