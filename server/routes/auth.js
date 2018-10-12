const express = require('express');
const jwt = require('jsonwebtoken');

const { generateUploadToken } = require('../libs/qiniu');

const config = require('../config');

const authRouter = express.Router();


authRouter.post('/', (req, res) => {
  const { username, password } = req.body;

  if (username === 'user' && password === 'pwd') {
    const token = jwt.sign({ user: username }, config.secret, {
      expiresIn: '1 day',
    });

    res.cookie('access-token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
    });

    res.status(200).send({
      token,
    });
  } else {
    res.sendStatus(401);
  }
});

authRouter.post('/qiniu', (req, res) => {
  let upToken = req.cookies['up-token'];
  if (upToken) {
    res.json({
      token: upToken,
    });
  } else {
    upToken = generateUploadToken();

    res.cookie('up-token', upToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // one day
    });

    res.status(200).send({
      token: upToken,
    });
  }
});


module.exports = authRouter;
