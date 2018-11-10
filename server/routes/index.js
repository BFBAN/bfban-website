const express = require('express');
const csrf = require('csurf');
const { checkGameIdExist } = require('../libs/webshot');

const router = express.Router();

// csrf protection
const csrfProtection = csrf({ cookie: true });

const grabYouku = require('../scraper/youku');
const grabTeamliquid = require('../scraper/teamliquid');

const { getCaptcha } = require('../libs/captcha');

router.get('/', csrfProtection, (req, res, next) => {
  res.render('index', { title: '联BAN调查局', csrfToken: req.csrfToken() });
});

router.get('/youku/:name', async (req, res) => {
  res.json(await grabYouku(req.params.name));
});

router.get('/teamliquid/*', async (req, res) => {
  console.log(req.params);
  res.json(await grabTeamliquid(req.params[0]));
});

router.post('/checkGameIdExist', async (req, res) => {
  const { id, gameName } = req.body;
  let idExist;
  if (gameName === 'bfv' || gameName === 'bf4') {
    idExist = true;
  } else {
    idExist = await checkGameIdExist(id);
  }

  return res.json({
    error: 0,
    idExist,
  });
});

router.use('/captcha', getCaptcha);

router.use('/auth', require('./auth'));

// router.use('/upload', require('./upload'));

// signin, signup, report, verify
router.use('/account', require('./user'));
router.use('/cheaters', require('./cheater'));


module.exports = router;
