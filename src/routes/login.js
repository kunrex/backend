import express from "express";

import { loginPageErrorHandler, loginPageHandler } from "../handlers/auth.js";

export const router = express.Router()

router.get('/', loginPageHandler)
router.get('/:error', loginPageErrorHandler)