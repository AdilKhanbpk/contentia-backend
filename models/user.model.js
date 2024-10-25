import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      default: "customer",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    fullName: {
      type: String,
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
    age: {
      type: Number,
    },
    phoneNumber: {
      type: String,
    },
    customerStatus: {
      type: String,
      default: "waiting",
    },
    password: {
      type: String,
      required: true,
    },
    invoice: {
      type: {
        type: String,
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
    rememberMe: {
      type: Boolean,
      default: false,
    },
    termsAndConditionsApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // if the password is modified then allow the hashed password otherwise do nothing

  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

userSchema.pre("save", function (next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (this.email === adminEmail) {
    this.role = "admin";
  }

  next();
});

userSchema.methods.AccessToken = function () {
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

userSchema.methods.RefreshToken = function () {
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

userSchema.methods.ComparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
