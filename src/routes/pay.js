import express from "express";

import { authorise } from "../services/utils.js";

import { confirmPaymentHandler, renderPaymentHandler } from "../handlers/orders.js";

export const router = express.Router()

router.get('/:orderId', authorise, renderPaymentHandler)
router.post('/confirm/:orderId', authorise, confirmPaymentHandler)

