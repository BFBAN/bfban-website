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

const router = express.Router();

router.get('/statistics');

router.get('/activities');

router.post('/search');

export default router;