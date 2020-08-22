const express = require('express');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');
const { generatePassword, comparePassword } = require('../libs/auth');

// csrf protection
const csrfProtection = csrf({ cookie: true });

const config = require('../config');

const router = express.Router();
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');
const { getDatetime } = require('../libs/misc');


// username, password
router.post('/signin', [
  check('username').trim().not().isEmpty(),
  check('password').trim().not().isEmpty(),
  check('captcha').trim().not().isEmpty()
    .isLength({ min: 4, max: 4 }),
], verifyCatpcha, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const { username, password } = req.body;

  const result = await db.query('select * from users where username = ?', [username]);

  if (result[0] && result[0].valid === '1' && comparePassword(password, result[0].password)) {
    const userPrivilege = result[0].privilege;
    const { uId } = result[0];

    const userPayload = {
      username,
      userId: result[0].id,
      userPrivilege,
      uId,
    };
    const token = jwt.sign(userPayload, config.secret, {
      expiresIn: '7 day',
    });

    res.cookie('access-token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 day
      sameSite: 'None',
      secure: true,
    });

    return res.json({
      error: 0,
      data: userPayload,
      token,
    });
  }
  return res.json({
    error: 1,
    msg: 'username or password wrong',
  });
});

// username, password
router.post('/signup', [
  check('username').trim().not().isEmpty()
    .isLength({ min: 4 }),
  check('password').trim().not().isEmpty()
    .isLength({ min: 6 }),
  check('captcha').trim().not().isEmpty()
    .isLength({ min: 4, max: 4 }),
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

  const d = getDatetime();

  const uId = uuidv4();

  let result;

  try {
    result = await db.query('insert into users set ?', {
      username,
      password: hash,
      originId,
      qq,
      createDatetime: d,
      updateDatetime: d,
      uId,
    });
  } catch (e) {
    next(e);
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
    uId,
  };
  const token = jwt.sign(userPayload, config.secret, {
    expiresIn: '1 day',
  });

  res.cookie('access-token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
    sameSite: 'None',
    secure: true,
  });

  return res.json({
    error: 0,
    data: userPayload,
    token,
  });
});

function encodeBase64(str) {
  return Buffer.from(str).toString('base64')
}
function decodeBase64(code) {
  return Buffer.from(code, 'base64').toString('ascii')
}

router.post('/reset', [
  check('qq').trim().isNumeric(),
  check('token').trim().not().isEmpty(),
  check('password').trim().not().isEmpty()
    .isLength({ min: 6 }),
  check('passwordRepeat').trim().not().isEmpty()
    .isLength({ min: 6 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    token, qq, password, passwordRepeat,
  } = req.body;

  try {
    if (password.trim() !== passwordRepeat.trim())
      throw(new Error('两次密码输入不同'))

    const [uIdBase64ed, invalidDatetimeBase64ed] = token.split('-')
    const uId = decodeBase64(uIdBase64ed)
    const invalidDatetime = Number(decodeBase64(invalidDatetimeBase64ed))

    // 2 天有效期
    if ((moment(invalidDatetime).utc().diff(moment.utc()), 'days', true) < 0) {
      throw(new Error('token expired'))
    }

    const result = await db.query('select * from users where uId = ? and qq = ? and valid = ?', [uId, qq, '1']);

    if (result[0] && result[0].valid === '1') {
      const hash = generatePassword(password)
      await db.query(`update users set password = ? where uId = ?`, [hash, uId])

      return res.json({
        error: 0,
        msg: '重置密码成功'
      })
    } else {
      throw(new Error('invalid token'))
    }
  } catch(e) {
    return res.json({
      error: 1,
      msg: e.message
    })
  }




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

router.get('/:uId', [
  check('uId').trim().isUUID(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const { uId } = req.params;
  const result = await db.query('select * from users where uId = ? and valid = "1"', [uId]);

  if (result.length === 0) {
    return res.json({
      error: 1,
      msg: 'user not exists',
    });
  }

  const {
    username, originId, privilege, createDatetime, id,
  } = result[0];

  // todo:
  const reports = await db.query(`select 
    t1.createDatetime, t1.game, t1.cheaterGameName as originId, t1.originUserId, 
    t2.status, t2.updateDatetime
    from user_report_cheater as t1
    inner join cheaters as t2 
    on t1.originUserId = t2.originUserId
    where t1.userId = ? and t1.valid = '1' and t2.valid = '1' order by createDatetime DESC`, [id])
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: {
      username,
      originId,
      privilege,
      createDatetime,
      reports,
    },
  });
});

module.exports = router;
