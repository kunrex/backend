import express from "express";

import { authorise, authoriseChef } from "../services/utils.js";

import { renderIncompleteSubordersHandler, updateSubordersStatusHandler } from "../handlers/orders.js";

export const router = express.Router()

router.get('/', authorise, authoriseChef, renderIncompleteSubordersHandler)
router.post('/update', authorise, authoriseChef, updateSubordersStatusHandler)