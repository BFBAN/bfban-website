const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
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
    const uId = result[0].uId;

    const userPayload = {
      username,
      userId: result[0].id,
      userPrivilege,
      uId,
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
    uId,
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

router.get('/:uId', async (req, res, next) => {
  const uId = req.params.uId;

  const result = await db.query('select * from users where uId = ?', [uId])
  .catch(e => next(e));

  const {username, originId, privilege, createDatetime, id} = result[0];

  const bf1Reports = await db.query(`select t1.createDatetime, t2.updateDatetime, t2.uId, t2.originId, t2.status 
    from user_report_cheater as t1
    inner join cheaters as t2 
    on t1.cheaterUId = t2.uId
    where t1.userId = ? order by createDatetime DESC`, [id])
  .catch(e => next(e));

  const bfvReports = await db.query(`select t1.createDatetime, t2.updateDatetime, t2.uId, t2.originId, t2.status 
    from user_report_cheater as t1
    inner join bfv_cheaters as t2 
    on t1.cheaterUId = t2.uId
    where t1.userId = ? order by createDatetime DESC`, [id])
  .catch(e => next(e));


  res.json({
    error: 0,
    data: {
      username, originId, privilege, createDatetime,
      bf1Reports,
      bfvReports,
    }
  })

});

module.exports = router;
