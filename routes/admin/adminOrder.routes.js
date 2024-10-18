const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const OrderController = require("../../controllers/admin/adminOrder.controller");

const router = express.Router();

router.post("/", protect, OrderController.createOrder);
router.get("/", protect, OrderController.getOrders);
router.get("/:id", protect, OrderController.getOrderById);
router.put("/:id", protect, OrderController.updateOrder);
router.delete("/:id", protect, OrderController.deleteOrder);

module.exports = router;
