import mongoose from "mongoose";
const Schema = mongoose.Schema;

const incomingPaymentSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        invoiceImage: {
            type: String,
            trim: true,
        },
        paymentAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid", "refund"],
            default: "unpaid",
        },
        refundStatus: {
            type: String,
            enum: ["refunded", "not-refunded"],
            default: "not-refunded",
        },
    },
    {
        timestamps: true,
    }
);

const IncomingPayment =
    mongoose.models.IncomingPayment ||
    mongoose.model("IncomingPayment", incomingPaymentSchema);

export default IncomingPayment;
