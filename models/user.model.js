import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const requiredIfInvoiceType = (invoiceType, type) => {
    return function () {
        return this.invoiceType === invoiceType && type;
    };
};

const userSchema = new mongoose.Schema(
    {
        authProvider: {
            type: String,
            enum: ["google", "credentials"],
            default: "credentials",
        },
        status: {
            type: String,
            enum: ["approved", "waiting", "rejected"],
            default: "waiting",
        },
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
        profilePic: {
            type: String,
            default: function () {
                return `https://ui-avatars.com/api/?name=${this.fullName
                    ?.slice(0, 2)
                    .toUpperCase()}&background=4D4EC9&color=ffffff&size=128`;
            },
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
            enum: ["waiting", "approved", "rejected"],
            default: "waiting",
        },
        password: {
            type: String,
            required: function () {
                return this.authProvider === "credentials";
            },
        },

        invoiceType: {
            type: String,
            enum: ["individual", "institutional", null],
            default: null,
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
        refreshToken: {
            type: String,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
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
            role: this.role,
            userType: this.userType,
            profilePic: this.profilePic,
            authProvider: this.authProvider,
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
