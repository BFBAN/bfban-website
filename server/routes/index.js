const express = require('express');
const csrf = require('csurf');

const router = express.Router();

const csrfProtection = csrf({ cookie: true });

const grabYouku = require('../scraper/youku');
const grabTeamliquid = require('../scraper/teamliquid');

router.get('/', csrfProtection, (req, res, next) => {
  res.render('index', { title: 'Hello world', csrfToken: req.csrfToken() });
});

router.get('/youku/:name', async (req, res) => {
  res.json(await grabYouku(req.params.name));
});

router.get('/teamliquid/*', async (req, res) => {
  console.log(req.params);
  res.json(await grabTeamliquid(req.params[0]));
});

module.exports = router;
