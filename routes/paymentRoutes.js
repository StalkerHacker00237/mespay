import express from "express";

import {
    createPayment,
    checkPaymentStatus
} from "../controllers/paymentController.js";

const router = express.Router();

// ======================================
// CREATE PAYMENT
// ======================================

router.post("/pay", createPayment);

// ======================================
// VERIFY PAYMENT STATUS
// ======================================

router.get("/status/:token", checkPaymentStatus);

export default router;