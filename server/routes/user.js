const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');

const config = require('../config');

const router = express.Router();
const db = require('../mysql');


// username, password
router.post('/signin', async (req, res, next) => {
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
router.post('/signup', async (req, res, next) => {
  const {
    username, password, originId, qq,
  } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  const result = await db.query('insert into users set ?', {
    username,
    password: hash,
    origin_id: originId,
    qq,
    create_datetime: d,
    update_datetime: d,
  })
    .catch(e => next(e));

  const userPrivilege = result.privilege;

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
router.post('/logout', (req, res, next) => {
  res.cookie('access-token', '');

  res.redirect('/');
});

module.exports = router;
