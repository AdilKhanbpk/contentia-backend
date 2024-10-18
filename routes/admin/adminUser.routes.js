const express = require("express");
const adminUserController = require("../../controllers/admin/adminUser.controller");
const { protect } = require("../../controllers/auth.controller");

const router = express.Router();

// Protect all routes
router.use(protect);

// Customer routes
router.post("/customers", adminUserController.createCustomer);
router.get("/customers", adminUserController.getAllCustomers);
router.get("/customers/:id", adminUserController.getSingleCustomer);
router.put("/customers/:id", adminUserController.updateCustomer);
router.delete("/customers/:id", adminUserController.deleteCustomer);

// Creator routes
router.post("/creators", adminUserController.createCreator);
router.get("/creators", adminUserController.getAllCreators);
router.get("/creators/:id", adminUserController.getSingleCreator);
router.put("/creators/:id", adminUserController.updateCreator);
router.delete("/creators/:id", adminUserController.deleteCreator);

module.exports = router;
