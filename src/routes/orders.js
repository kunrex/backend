import express from "express";

import { authorise, authoriseAdmin } from "../services/utils.js";

import { renderAllOrdersHandler, renderUserOrdersHandler } from "../handlers/orders.js";

export const router = express.Router()

router.get('/my/', authorise, renderUserOrdersHandler)
router.get('/all/', authorise, authoriseAdmin, renderAllOrdersHandler)