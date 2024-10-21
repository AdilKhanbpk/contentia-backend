import mongoose from "mongoose";

const ordersProfileSchema = new mongoose.Schema({
  address: String,
  companyTitle: String,
  confirmNewPassword: String,
  currentPassword: String,
  email: String,
  invoiceType: {
    type: String,
    enum: ["Bireysel", "Kurumsal"],
  },
  name: String,
  newPassword: String,
  phone: String,
  taxNumber: String,
  taxOffice: String,
  tcNumber: String,
});

const OrdersProfile = mongoose.model("OrdersProfile", ordersProfileSchema);

export default OrdersProfile;
