import mongoose from "mongoose";

// Define sub-schemas for nested objects
const ProfileInformationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  verificationCode: String,
  isVerified: Boolean,
  tckn: String,
  dateOfBirth: Date,
  gender: String,
});

const PaymentInformationSchema = new mongoose.Schema({
  ad_soyad: String,
  tr_id: String,
  iban_number: String,
  address: String,
  invoice_status: Boolean,
  company_name: String,
  tax_number: String,
  tax_office: String,
});

const BillingInformationSchema = new mongoose.Schema({
  ad_soyad: String,
  tr_id: String,
  address: String,
  company_name: String,
  tax_number: String,
  tax_office: String,
});

const AddressDetailsSchema = new mongoose.Schema({
  country: String,
  state: String,
  district: String,
  neighbourhood: String,
  full_address: String,
});

const ContentInfoSchema = new mongoose.Schema({
  contentType: String,
  content_formats: [String],
  area_of_interest: [String],
  address_details: AddressDetailsSchema,
});

const SocialMediaSchema = new mongoose.Schema({
  contentType: String,
  platforms: {
    Instagram: Object,
    TikTok: Object,
    Facebook: Object,
    Youtube: Object,
    X: Object,
    Linkedin: Object,
  },
  instagramLink: String,
  user_agreement: Boolean,
  approved_commercial: Boolean,
});

const CreatorFormSchema = new mongoose.Schema({
  profile_information: ProfileInformationSchema,
  payment_information: PaymentInformationSchema,
  billing_information: BillingInformationSchema,
  content_information: ContentInfoSchema,
  social_information: SocialMediaSchema,
});

const CreatorForm = mongoose.model("becomecreator", CreatorFormSchema);

export default CreatorForm;
