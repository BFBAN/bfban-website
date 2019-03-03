const express = require('express');
const csrf = require('csurf');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');

// const { checkGameIdExist } = require('../libs/webshot');
const { verifyJWTMiddleware, verifyAdminPrivilegeMiddleware } = require('../middlewares/auth');
const { addOneDay, convertDatetimeToTimeZone } = require('../libs/misc');
const { getUserInfo } = require('../libs/origin');

const router = express.Router();

// cors options
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin')); // better than wildcard *
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// csrf protection
const csrfProtection = csrf({ cookie: true });

const grabYouku = require('../scraper/youku');
const grabTeamliquid = require('../scraper/teamliquid');

const { getCaptcha } = require('../libs/captcha');
const db = require('../mysql');

async function getReportNum() {
  const tmp = await db.query('select count(*) as num from user_report_cheater where valid = "1"');
  return tmp[0].num;
}

async function getUserNum() {
  const tmp = await db.query('select count(*) as num from users where valid = "1"');
  return tmp[0].num;
}

async function getCheaterNum() {
  const tmp = await db.query('select count(*) as num from cheaters where status = "1" and valid = "1"');
  return tmp[0].num;
}

// router.get('/', csrfProtection, (req, res, next) => {
//   res.render('index', { title: '战地风云联BAN调查局', csrfToken: req.csrfToken() });
// });

router.post('/checkGameIdExist', [
  check('id').not().isEmpty(),
], verifyJWTMiddleware, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const { id } = req.body;

  const userInfo = await getUserInfo({ originId: id });
  console.log('userInfo:', userInfo);

  const idExist = !userInfo.error;

  return res.json({
    error: 0,
    idExist,
    originUserId: userInfo.userId,
    originPersonaId: userInfo.personaId,
    avatarLink: userInfo.avatarLink,
  });
});

// ?id=fxodo
router.get('/search', async (req, res, next) => {
  const { id } = req.query;

  // if false, invalid originId
  // const idExist = await checkGameIdExist(id);

  const cheatersQueryResult = await db.query('select DISTINCT(cheaterGameName) as originId, originUserId from origin where cheaterGameName like ?', [`%${id}%`]);
  // const cheatersQueryResult = await db.query('select originId, status, originUserId, createDatetime, game from cheaters where valid = \'1\' and originId like ?', [`%${id}%`]);

  return res.json({
    error: 0,
    data: {
      cheaters: cheatersQueryResult,
    },
  });
});

// activities (reports, verifies, registers)
router.get('/activity', async (req, res) => {
  // subtract 12 hours
  const d = moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm:ss');

  const registers = await db.query('select uId, username, createDatetime from users where createDatetime >= ?', [d]);

  const reports = await db.query(`select t1.originUserId, t1.createDatetime, t2.username, t2.uId, t1.cheaterGameName as cheaterOriginId, t1.game
  from user_report_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  where t1.createDatetime >= ? and t1.valid = '1'`,
  [d]);

  const verifies = await db.query(`select t1.status, t2.username, t2.uId, t3.originId as cheaterOriginId, t1.originUserId, t1.createDatetime
  from user_verify_cheater as t1
  inner join users as t2 on t1.userId = t2.id
  inner join cheaters as t3 on t1.originUserId = t3.originUserId
  where t1.createDatetime >= ? and t1.valid = '1'`,
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

// signin, signup, report, verify
router.use('/account', require('./user'));
router.use('/cheaters', require('./cheater'));


// test purpose

// router.get('/youku/:name', async (req, res) => {
//   res.json(await grabYouku(req.params.name));
// });

// router.get('/teamliquid/*', async (req, res) => {
//   console.log(req.params);
//   res.json(await grabTeamliquid(req.params[0]));
// });

// router.use('/upload', require('./upload'));

// test purpose


module.exports = router;
