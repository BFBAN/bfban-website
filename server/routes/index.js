const express = require('express');
const csrf = require('csurf');
const moment = require('moment');
const { checkGameIdExist } = require('../libs/webshot');

const router = express.Router();

// csrf protection
const csrfProtection = csrf({ cookie: true });

const grabYouku = require('../scraper/youku');
const grabTeamliquid = require('../scraper/teamliquid');

const { getCaptcha } = require('../libs/captcha');
const db = require('../mysql');

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


// home page routes

// ?id=fxodo
router.get('/search', async (req, res, next) => {
  const { id } = req.query;

  // if false, invalid originId
  const idExist = await checkGameIdExist(id);

  const cheatersQueryResult = await db.query('select originId, status, uId, createDatetime, game from cheaters where originId like ?', [`%${id}%`])
  .catch(e => next(e));

  return res.json({
    error: 0,
    data: {
      idExist,
      cheaters: cheatersQueryResult,
    }
  });

});

// 24h activities (reports, verifies)
router.get('/activity', async (req, res) => {
  const d = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');

  const reports = await db.query(`select t1.cheaterUId, t1.createDatetime, t2.username, t2.uId, t3.originId as cheaterOriginId
  from user_report_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  inner join cheaters as t3 on t1.cheaterUId = t3.uId
  where t1.createDatetime >= ?`,
  [d]);

  const verifies = await db.query(`select t1.status, t2.username, t2.uId, t3.originId as cheaterOriginId, t1.cheaterUId, t1.createDatetime
  from user_verify_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  inner join cheaters as t3 on t1.cheaterUId = t3.uId
  where t1.createDatetime >= ?`,
  [d]);

  res.json({
    error: 0,
    data: {
      reports,
      verifies,
    }
  });
});
// daily reports num
router.get('/daily_reports', async (req, res) => {
});

router.use('/captcha', getCaptcha);

router.use('/auth', require('./auth'));

// router.use('/upload', require('./upload'));

// signin, signup, report, verify
router.use('/account', require('./user'));
router.use('/cheaters', require('./cheater'));


module.exports = router;
