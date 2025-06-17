import express from "express";

import { authorise, authoriseAdmin } from "../services/utils.js";

import { addFoodHandler, addTagHandler, editTagsHandler, renderAddHandler, renderUserInfoHandler, setUserAuthHandler } from "../handlers/admin.js";

export const router = express.Router()

router.get('/userinfo', authorise, authoriseAdmin, renderUserInfoHandler)
router.get('/userinfo/:email', authorise, authoriseAdmin, renderUserInfoHandler)

router.post('/grant/:email', authorise, authoriseAdmin, setUserAuthHandler)

router.get('/add', authorise, authoriseAdmin, renderAddHandler)

router.post('/add/food', authorise, authoriseAdmin, addFoodHandler)
router.post('/add/tags/add/:tag', authorise, authoriseAdmin, addTagHandler)
router.post('/add/tags/edit/:foodId', authorise, authoriseAdmin, editTagsHandler)