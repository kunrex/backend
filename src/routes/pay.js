import express from "express";

import { authorise } from "../services/utils.js";

import { confirmPaymentHandler, renderPaymentHandler } from "../handlers/orders.js";

export const router = express.Router()

router.get('/pay/:orderId', authorise, renderPaymentHandler)
router.post('/pay/confirm/:orderId', authorise, confirmPaymentHandler)

