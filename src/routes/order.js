import express from "express";

import { authorise } from "../services/utils.js";

import { readonlyCheck, renderOrderCheck } from "../middleware/orders.js";
import { completeOrderHandler, newOrderHandler, renderOrderHandler, renderPaymentHandler, updateOrderHandler } from "../handlers/orders.js";

export const router = express.Router();

router.get('/', authorise, newOrderHandler)
router.get('/readonly/:orderId', authorise, readonlyCheck, renderOrderHandler)
router.get('/:orderId/:authorName', authorise, renderOrderCheck, renderOrderHandler)

router.post('/pay/:orderId', authorise, renderPaymentHandler)
router.post('/update/:orderId', authorise, updateOrderHandler)
router.post('/complete/:orderId', authorise, completeOrderHandler)