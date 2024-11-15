import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const CreatorFormSchema = new mongoose.Schema(
  {
    identityNo: {
      type: Number,
    },
    favoriteOrders: {
      type: [mongoose.Types.ObjectId],
      ref: "Order",
    },
    authProvider: {
      type: String,
      enum: ["google", "credentials"],
      default: "credentials",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
    },
    userType: {
      type: String,
      enum: ["customer", "creator"],
      default: "creator",
    },
    addressDetails: {
      addressOne: {
        type: String,
      },
      addressTwo: {
        type: String,
      },
      country: {
        type: String,
      },
      zipCode: {
        type: String,
      },
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "credentials";
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required."],
    },
    gender: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["individual", "institutional"],
    },
    paymentInformation: {
      ibanNumber: {
        type: String,
      },
      address: {
        type: String,
      },
      fullName: {
        type: String,
      },
      trId: {
        type: String,
      },
      companyName: {
        type: String,
      },
      taxNumber: {
        type: String,
      },
      taxOffice: {
        type: String,
      },
    },

    invoiceType: {
      type: String,
      enum: ["individual", "institutional"],
    },

    billingInformation: {
      invoiceStatus: {
        type: Boolean,
      },
      trId: {
        type: String,
      },
      address: {
        type: String,
      },
      fullName: {
        type: String,
      },
      companyName: {
        type: String,
      },
      taxNumber: {
        type: String,
      },
      taxOffice: {
        type: String,
      },
    },

    preferences: {
      contentInformation: {
        contentType: {
          type: String,
          enum: ["product", "service", "space"],
        },
        creatorType: {
          type: String,
          enum: ["macro", "micro"],
          default: "macro",
        },
        contentFormats: [String],
        areaOfInterest: [String],
        addressDetails: {
          country: {
            type: String,
          },
          state: {
            type: String,
          },
          district: {
            type: String,
          },
          neighbourhood: {
            type: String,
          },
          fullAddress: {
            type: String,
          },
        },
      },
      socialInformation: {
        contentType: {
          type: String,
          enum: ["product", "service"],
        },
        platforms: {
          Instagram: {
            followers: Number,
            username: String,
          },
          TikTok: {
            followers: Number,
            username: String,
          },
          Facebook: {
            followers: Number,
            username: String,
          },
          Youtube: {
            followers: Number,
            username: String,
          },
          X: {
            followers: Number,
            username: String,
          },
          Linkedin: {
            followers: Number,
            username: String,
          },
        },
        portfolioLink: [String],
      },
    },

    userAgreement: {
      type: Boolean,
      required: [true, "User agreement is required."],
    },
    approvedCommercial: Boolean,
  },
  { timestamps: true }
);

CreatorFormSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // if the password is modified then allow the hashed password otherwise do nothing

  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

CreatorFormSchema.pre("save", function (next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (this.email === adminEmail) {
    this.role = "admin";
  }

  next();
});

CreatorFormSchema.methods.AccessToken = function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
    }
  );
  return accessToken;
};

CreatorFormSchema.methods.RefreshToken = function () {
  const refreshToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    }
  );
  return refreshToken;
};

CreatorFormSchema.methods.ComparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const CreatorModel = mongoose.model("Creator", CreatorFormSchema);

export default CreatorModel;
