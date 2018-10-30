const express = require('express');
const csrf = require('csurf');

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

router.use('/captcha', getCaptcha);


router.use('/auth', require('./auth'));

// router.use('/upload', require('./upload'));

// signin, signup, report, verify
router.use('/account', require('./user'));
router.use('/cheaters', require('./cheater'));


module.exports = router;
