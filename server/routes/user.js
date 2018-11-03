const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');
const { generatePassword, comparePassword } = require('../libs/auth');

const config = require('../config');

const router = express.Router();
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');


// username, password
router.post('/signin', [
  check('username').not().isEmpty(),
  check('password').not().isEmpty(),
  check('captcha').not().isEmpty().isLength({min:4, max: 4}),
], verifyCatpcha, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const { username, password } = req.body;

  const result = await db.query('select * from users where username = ?', [username])
    .catch(e => next(e));

  if (result[0] && result[0].valid === '1' && comparePassword(password, result[0].password)) {
    const userPrivilege = result[0].privilege;

    const userPayload = {
      username,
      userId: result[0].id,
      userPrivilege,
    };
    const token = jwt.sign(userPayload, config.secret, {
      expiresIn: '1 day',
    });

    res.cookie('access-token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
    });

    res.json({
      error: 0,
      data: userPayload,
    });
  } else {
    res.json({
      error: 1,
      msg: 'username or password wrong',
    });
  }
});

// username, password
router.post('/signup', [
  check('username').not().isEmpty().isLength({min: 4}),
  check('password').not().isEmpty().isLength({min: 6}),
  check('captcha').not().isEmpty().isLength({min:4, max: 4}),
  check('qq').optional({ checkFalsy: true }).isNumeric(),
], verifyCatpcha, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    username, password, originId, qq,
  } = req.body;

  const hash = generatePassword(password);

  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  let result;

  try {
    result = await db.query('insert into users set ?', {
      username,
      password: hash,
      originId,
      qq,
      createDatetime: d,
      updateDatetime: d,
    });
  } catch (e) {
    console.error(e);
    return res.json({
      error: 1,
      msg: 'insert user failed',
    });
  }

  // default 'normal'
  const userPrivilege = 'normal';

  // jwt token
  const userPayload = {
    username,
    userId: result.insertId,
    userPrivilege,
  };
  const token = jwt.sign(userPayload, config.secret, {
    expiresIn: '1 day',
  });

  res.cookie('access-token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
  });

  res.json({
    error: 0,
    data: userPayload,
  });
});

//
router.get('/signout', (req, res, next) => {
  res.clearCookie('access-token');
  res.clearCookie('up-token');

  // res.redirect('/');
  res.json({
    error: 0,
    msg: '注销成功',
  });
});

module.exports = router;
