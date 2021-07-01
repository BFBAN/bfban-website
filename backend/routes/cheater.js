import express from "express";
import moment from "moment";
import validator from "validator";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { originClients } from "../lib/origin.js"

const router = express.Router()

router.get('/cheaters');

router.get('/cheater');

router.post('/report');

router.get('/timeline');

router.post('/comment');

router.post('/update');

router.post('/judgement');

router.post('/banappeal');

export default router;