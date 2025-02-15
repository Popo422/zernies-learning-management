import express from "express";

import { createStripePaymentIntent, createTransaction } from "../controller/transactionController";

const router = express.Router();

router.post("/stripe/payment-intent", createStripePaymentIntent);
router.post("/", createTransaction);
export default router;
