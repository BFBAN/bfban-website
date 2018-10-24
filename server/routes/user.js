const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');

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

  if (result[0] && await bcrypt.compare(password, result[0].password)) {
    const userPrivilege = result[0].privilege;

    const token = jwt.sign({
      username,
      userId: result[0].id,
      userPrivilege,
    }, config.secret, {
      expiresIn: '1 day',
    });

    res.cookie('access-token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
    });

    res.json({
      error: 0,
      data: {
        username,
        userPrivilege,
      },
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
  check('username').not().isEmpty(),
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

  const hash = await bcrypt.hash(password, 10);

  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  let result;

  try {
    result = await db.query('insert into users set ?', {
      username,
      password: hash,
      origin_id: originId,
      qq,
      create_datetime: d,
      update_datetime: d,
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
  const token = jwt.sign({
    username,
    userId: result.insertId,
    userPrivilege,
  }, config.secret, {
    expiresIn: '1 day',
  });

  res.cookie('access-token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
  });

  res.json({
    error: 0,
    data: {
      username,
      userPrivilege,
    },
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
