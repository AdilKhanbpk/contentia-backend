import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "user",
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

userSchema.pre("save", function (next) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (this.email === adminEmail) {
    this.role = "admin";
  }

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
