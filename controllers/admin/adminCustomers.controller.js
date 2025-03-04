import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createCustomer = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        age,
        role,
        phoneNumber,
        password,
        invoiceType,
        billingInformation,
    } = req.body;

    if (
        !fullName ||
        !email ||
        !age ||
        !phoneNumber ||
        !password ||
        !invoiceType ||
        !billingInformation
    ) {
        throw new ApiError(400, "Please fill all the required fields");
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
        throw new ApiError(400, "Email address is already in use.");
    }

    if (invoiceType === "individual") {
        // console.log("Invoice type:", invoiceType);
        // console.log(billingInformation);

        if (
            !billingInformation?.invoiceStatus ||
            !billingInformation?.address ||
            !billingInformation?.trId
        ) {
            throw new ApiError(
                400,
                "Please fill invoiceStatus , address and trId for individual invoice type"
            );
        }

        if (!billingInformation?.fullName) {
            throw new ApiError(
                400,
                "Please fill fullName for individual invoice type"
            );
        }
    } else if (invoiceType === "institutional") {
        // console.log("Invoice type:", invoiceType);
        if (
            !billingInformation?.companyName ||
            !billingInformation?.taxNumber ||
            !billingInformation?.taxOffice
        ) {
            throw new ApiError(
                400,
                "Please fill company , taxNumber and taxOffice for institutional invoice type"
            );
        }
    } else {
        throw new ApiError(
            400,
            "Invoice type must be 'individual' or 'institutional'"
        );
    }

    const newUser = await User.create({
        fullName,
        email,
        age,
        role,
        phoneNumber,
        password,
        invoiceType,
        billingInformation,
        termsAndConditionsApproved: true,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newUser, "User created successfully"));
});

const updateCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const {
        status,
        userType,
        role,
        fullName,
        email,
        age,
        phoneNumber,
        invoiceType,
        billingInformation,
    } = req.body;

    isValidId(customerId);

    const customer = await User.findById(customerId);

    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    if (
        invoiceType === "individual" &&
        (!billingInformation?.invoiceStatus ||
            !billingInformation?.address ||
            !billingInformation?.trId ||
            !billingInformation?.fullName)
    ) {
        throw new ApiError(
            400,
            "Please fill invoiceStatus, address, trId, and fullName for individual invoice type"
        );
    }

    if (
        invoiceType === "institutional" &&
        (!billingInformation?.companyName ||
            !billingInformation?.taxNumber ||
            !billingInformation?.taxOffice)
    ) {
        throw new ApiError(
            400,
            "Please fill companyName, taxNumber, and taxOffice for institutional invoice type"
        );
    }

    if (
        invoiceType &&
        invoiceType !== "individual" &&
        invoiceType !== "institutional"
    ) {
        throw new ApiError(
            400,
            "Invoice type must be 'individual' or 'institutional'"
        );
    }

    const updatedCustomer = await User.findByIdAndUpdate(
        customerId,
        {
            status,
            userType,
            role,
            fullName,
            email: email.toLowerCase().trim(),
            age,
            phoneNumber,
            invoiceType,
            billingInformation,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedCustomer,
                "Customer updated successfully"
            )
        );
});

const getCustomers = asyncHandler(async (req, res) => {
    const customers = await User.find({
        role: "user",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, customers, "Customers fetched successfully")
        );
});
const getAdminCustomers = asyncHandler(async (req, res) => {
    const admins = await User.find({
        role: "admin",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, admins, "Admins fetched successfully")
        );
});

const getCustomerById = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    isValidId(customerId);

    const customer = await User.findById(customerId);

    return res
        .status(200)
        .json(new ApiResponse(200, customer, "Customer fetched successfully"));
});

const deleteCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    isValidId(customerId);

    const deletedCustomer = await User.findByIdAndDelete(customerId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedCustomer,
                "Customer deleted successfully"
            )
        );
});

export {
    createCustomer,
    getAdminCustomers,
    updateCustomer,
    getCustomers,
    getCustomerById,
    deleteCustomer,
};
