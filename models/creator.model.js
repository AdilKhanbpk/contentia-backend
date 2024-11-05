import mongoose from "mongoose";

const requiredIfAccountType = (accountType, type) => {
  return function () {
    return this.accountType === accountType && type;
  };
};

const requiredIfInvoiceType = (invoiceType, type) => {
  return function () {
    return this.invoiceType === invoiceType && type;
  };
};

const CreatorFormSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    tckn: {
      type: String,
      required: [true, "TCKN is required."],
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
      required: [
        true,
        "Account type is required and must be 'individual' or 'institutional'.",
      ],
    },
    paymentInformation: {
      ibanNumber: {
        type: String,
        required: [true, "Payment -> IBAN number is required."],
      },
      address: {
        type: String,
        required: [true, "Payment -> Address is required."],
      },
      fullName: {
        type: String,
        required: requiredIfAccountType("individual", true),
      },
      trId: {
        type: String,
        required: requiredIfAccountType("individual", true),
      },
      companyName: {
        type: String,
        required: requiredIfAccountType("institutional", true),
      },
      taxNumber: {
        type: String,
        required: requiredIfAccountType("institutional", true),
      },
      taxOffice: {
        type: String,
        required: requiredIfAccountType("institutional", true),
      },
    },

    invoiceType: {
      type: String,
      enum: ["individual", "institutional"],
      required: [
        true,
        "Invoice type is required and must be 'individual' or 'institutional'.",
      ],
    },

    billingInformation: {
      invoiceStatus: {
        type: Boolean,
        required: [true, "Invoice status is required."],
      },
      trId: {
        type: String,
        required: [true, "Billing -> TR ID is required."],
      },
      address: {
        type: String,
        required: [true, "Billing -> Address is required."],
      },
      fullName: {
        type: String,
        required: requiredIfInvoiceType("individual", true),
      },
      companyName: {
        type: String,
        required: requiredIfInvoiceType("institutional", true),
      },
      taxNumber: {
        type: String,
        required: requiredIfInvoiceType("institutional", true),
      },
      taxOffice: {
        type: String,
        required: requiredIfInvoiceType("institutional", true),
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
        portfolioLink: {
          type: String,
        },
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

const CreatorModel = mongoose.model("Creator", CreatorFormSchema);

export default CreatorModel;
