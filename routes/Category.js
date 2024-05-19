import express from "express"

import { fetchCategory, createCategory } from '../controller/Category.js'

const router = express.Router();
//  /categories is already added in base path
router.get('/', fetchCategory).post('/',createCategory)

export default router;

