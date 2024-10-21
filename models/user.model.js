import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "user",
    },
    userType: {
      type: String,
      default: "customer",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    rememberMe: {
      type: Boolean,
      default: false, // For "Beni Hatırla"
    },
    termsAccepted: {
      type: Boolean,
      default: false, // For "Kullanıcı Sözleşmesi"
    },
    marketingConsent: {
      type: Boolean,
      default: false, // For "Ticari Elektronik İleti"
    },
    ordersProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrdersProfile", // Reference to OrdersProfile model
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
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
