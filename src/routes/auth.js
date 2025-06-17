import express from "express";

import { authMiddleware } from "../middleware/auth.js";
import { accessRefreshHandler } from "../handlers/auth.js";

export const router = express.Router()

router.post('/', authMiddleware)
router.get('/refresh', accessRefreshHandler)