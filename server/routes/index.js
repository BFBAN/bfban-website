const express = require('express');
const csrf = require('csurf');
const moment = require('moment');

// const { checkGameIdExist } = require('../libs/webshot');
const { addOneDay, convertDatetimeToTimeZone } = require('../libs/misc');
const { getUserInfo } = require('../libs/origin');

const router = express.Router();

// csrf protection
const csrfProtection = csrf({ cookie: true });

const grabYouku = require('../scraper/youku');
const grabTeamliquid = require('../scraper/teamliquid');

const { getCaptcha } = require('../libs/captcha');
const db = require('../mysql');

router.get('/', csrfProtection, (req, res, next) => {
  res.render('index', { title: '战地风云联BAN调查局', csrfToken: req.csrfToken() });
});

router.get('/youku/:name', async (req, res) => {
  res.json(await grabYouku(req.params.name));
});

router.get('/teamliquid/*', async (req, res) => {
  console.log(req.params);
  res.json(await grabTeamliquid(req.params[0]));
});

router.post('/checkGameIdExist', async (req, res) => {
  const { id } = req.body;
  let idExist;

  const userInfo = await getUserInfo({ originId: id });
  console.log('userInfo:', userInfo);

  idExist = !userInfo.error;

  return res.json({
    error: 0,
    idExist,
    originUserId: userInfo.userId,
    originPersonaId: userInfo.personaId,
    avatarLink: userInfo.avatarLink,
  });
});


// home page routes

// ?id=fxodo
router.get('/search', async (req, res, next) => {
  const { id } = req.query;

  // if false, invalid originId
  // const idExist = await checkGameIdExist(id);

  const cheatersQueryResult = await db.query('select originId, status, originUserId, createDatetime, game from cheaters where valid = \'1\' and originId like ?', [`%${id}%`])
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: {
      // idExist,
      cheaters: cheatersQueryResult,
    },
  });
});

async function getReportNum() {
  const tmp = await db.query('select count(*) as num from user_report_cheater');
  return tmp[0].num;
}

async function getUserNum() {
  const tmp = await db.query('select count(*) as num from users');
  return tmp[0].num;
}

async function getCheaterNum() {
  const tmp = await db.query('select count(*) as num from cheaters where status = 1');
  return tmp[0].num;
}

// activities (reports, verifies, registers)
router.get('/activity', async (req, res) => {
  // subtract 12 hours
  const d = moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm:ss');

  const registers = await db.query('select uId, username, createDatetime from users where createDatetime >= ?', [d]);

  const reports = await db.query(`select t1.originUserId, t1.createDatetime, t2.username, t2.uId, t1.cheaterGameName as cheaterOriginId, t3.game
  from user_report_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  inner join cheaters as t3 on t1.cheaterUId = t3.uId
  where t1.createDatetime >= ? and t3.valid = '1'`,
  [d]);

  const verifies = await db.query(`select t1.status, t2.username, t2.uId, t3.game, t3.originId as cheaterOriginId, t1.originUserId, t1.createDatetime
  from user_verify_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  inner join cheaters as t3 on t1.cheaterUId = t3.uId
  where t1.createDatetime >= ? and t3.valid = '1'`,
  [d]);

  res.json({
    error: 0,
    data: {
      registers,
      reports,
      verifies,
      number: {
        user: await getUserNum(),
        cheater: await getCheaterNum(),
        report: await getReportNum(),
      },
    },
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
