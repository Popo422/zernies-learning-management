import express from "express";

import { createStripePaymentIntent } from "../controller/transactionController";

const router = express.Router();

router.post("/stripe/payment-intent", createStripePaymentIntent);

export default router;
