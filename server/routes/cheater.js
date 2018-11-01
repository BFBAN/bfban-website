const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const { check, validationResult } = require('express-validator/check');

const { verifyJWTMiddleware, verifyPrivilegeMiddleware } = require('../middlewares/auth');
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');

const { uploadToSm } = require('../libs/webshot')

const router = express.Router();

function addOneDay(str) {
  return moment(str).add(1, 'day').format('YYYY-MM-DD');
}

// cheater list
// status
// 0=> 待处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的
// 不带 status 为 全部
// ?status=0
router.get('/', async (req, res, next) => {
  const {
    status = '',
    cd = ',',
    ud = ',',
    page = 1,
  } = req.query;
  let result;

  let [cdStart, cdEnd] = cd.split(',');
  let [udStart, udEnd] = ud.split(',');

  let statusQuery = '';
  let cdQuery = '';
  let udQuery = '';

  let queryVal = [];

  if (status && ['0', '1', '2', '3', '4'].indexOf(status) !== -1) {
    statusQuery = `and status = ?`;
    queryVal.push(status);
  }

    if ( cd && cd !== ',') {
    cdQuery = `and createDatetime >= ? and createDatetime <= ?`;
      queryVal.push(cdStart, addOneDay(cdEnd));
  }
  if (ud && ud !== ',') {
    udQuery = `and updateDatetime >= ? and updateDatetime <= ?`;
    queryVal.push(udStart, addOneDay(udEnd));
  }

  let querySql = `select originId, status, cheatMethods, uId, createDatetime, updateDatetime from cheaters where 1=1 ${statusQuery} ${cdQuery} ${udQuery} order by createDatetime DESC `;

  result = await db.query(querySql + `limit 10 offset ${(page - 1) * 10}`, queryVal)
    .catch(e => next(e));

  const total = await db.query(querySql, queryVal)
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: result,
    total: total.length,
  });
});

// cheater detail
// report, verify, confirm
router.get('/:uid', async (req, res, next) => {
  const cheaterUId = req.params.uid;
  const cheater = await db.query('select originId, status, bf1statsShot, trackerShot, trackerWeaponShot from cheaters where uId = ?', [cheaterUId])
    .catch(e => next(e));

  const reports = await db.query('select a.createDatetime, a.cheatMethods, a.bilibiliLink, a.description, b.username, b.privilege from user_report_cheater as a left join users as b on a.userId = b.id where a.cheaterUId = ? and a.valid = "1"', [cheaterUId])
    .catch(e => next(e));


  const verifies = await db.query('select a.id, a.userId, a.createDatetime, a.status, a.suggestion, a.cheatMethods, b.username, b.privilege from user_verify_cheater as a left join users as b on a.userId = b.id where a.cheaterUId = ?', [cheaterUId])
    .catch(e => next(e));

  const confirms = await db.query('select t1.userId, t1.`userVerifyCheaterId`, t2.username, t1.createDatetime, t3.cheatMethods from `user_confirm_verify` as t1 left join users as t2 on t1.userId = t2.id left join user_verify_cheater as t3 on t1.userVerifyCheaterId = t3.id where t3.cheaterUId = ?', [cheaterUId])
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: {
      cheater,
      reports,
      verifies,
      confirms,
    },
  });
});

// report cheater
// originId, cheatMethods, bilibiliLink, description
// insert user_report_cheater db
// userId, cheaterUId, datatime
router.post('/', verifyJWTMiddleware, verifyCatpcha, [
  check('originId').not().isEmpty().isAscii(),
  check('cheatMethods').not().isEmpty(),
  check('bilibiliLink').optional({ checkFalsy: true }).isURL(),
  check('captcha').not().isEmpty().isLength({min:4, max: 4}),
],
  async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    originId, cheatMethods, bilibiliLink, description,
  } = req.body;

  const { userId } = req.user;

  const re = await db.query('select * from cheaters where originId = ?', [originId])
    .catch(e => next(e));

  let cheaterUId;

  const uuId = uuidv4();
  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  // 若第一次举报
  if (re.length === 0) {
    await db.query('insert into cheaters set ?', {
      uId: uuId,
      originId,
      createDatetime: d,
    })
      .catch(e => next(e));

    cheaterUId = uuId;

    // 抓取截图，并存入数据库（异步进行）
    uploadToSm(`http://bf1stats.com/pc/${originId}`)
    .then((url) => {
      db.query('update cheaters set bf1statsShot = ? where uId = ?', [url, cheaterUId])
      .catch(e => next(e));
    });

    uploadToSm(`https://battlefieldtracker.com/bf1/profile/pc/${originId}`)
    .then((url) => {
      db.query('update cheaters set trackerShot = ? where uId = ?', [url, cheaterUId])
      .catch(e => next(e));
    });

    uploadToSm(`https://battlefieldtracker.com/bf1/profile/pc/${originId}/weapons`)
    .then((url) => {
      db.query('update cheaters set trackerWeaponShot = ? where uId = ?', [url, cheaterUId])
      .catch(e => next(e));
    });

  } else {
    // 若重复举报
    cheaterUId = re[0].uId;
    await db.query('update cheaters set status = ? where uId = ?', [0, cheaterUId])
      .catch(e => next(e));
  }


  try {
    await db.query('insert into user_report_cheater set ?', {
      userId,
      cheaterUId,
      createDatetime: d,
      cheatMethods,
      bilibiliLink,
      description,
    });

    res.json({
      error: 0,
      data: {
        cheaterUId,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: 1,
      msg: 'report failed',
    });
  }
});

// verify cheater
// status, suggestion, userId, cheaterUId, datetime
router.post('/verify', verifyJWTMiddleware, verifyPrivilegeMiddleware, [
  check('status').not().isEmpty(),
  check('suggestion').not().isEmpty(),
  check('cheatMethods').optional({ checkFalsy: true }),
  check('cheaterUId').isUUID(),
],
  async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'verify 请规范填写', errors: errors.array() });
  }

  let { status, suggestion, cheatMethods = '', cheaterUId } = req.body;

  const { userId } = req.user;

  if (status !== '1') {
    cheatMethods = '';
  }

  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  const result = await db.query('insert into user_verify_cheater set ? ', {
    status,
    suggestion,
    userId,
    cheaterUId,
    cheatMethods,
    createDatetime: d,
  })
    .catch(e => next(e));

  if (status === '1') {
    status = '0';
  }

  await db.query('update cheaters set status = ?, updateDatetime = ? where uId = ? ', [status, d, cheaterUId])
    .catch(e => next(e));

  const { username, userPrivilege } = req.user;
  return res.json({
    error: 0,
    data: {
      id: result.insertId,
      userId,
      cheaterUId,
      createDatetime: d,
      status,
      suggestion,
      cheatMethods,
      username,
      privilege: userPrivilege,
    },
  });
});

// confirm cheater
router.post('/confirm', verifyJWTMiddleware, verifyPrivilegeMiddleware, [
  check('userId').not().isEmpty(),
  check('userVerifyCheaterId').not().isEmpty(),
  check('cheatMethods').not().isEmpty(),
],
  async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'confirm 请规范', errors: errors.array() });
  }


  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  const { userId, userVerifyCheaterId, cheaterUId, cheatMethods } = req.body;

  await db.query('insert into user_confirm_verify set ?', {
    userId,
    userVerifyCheaterId,
    createDatetime: d,
  })
  .catch(e => next(e));

  // 石锤的 第二个 步骤
  // update status, cheatMethods, updateDatetime
  await db.query('update cheaters set status = "1", cheatMethods = ?, updateDatetime = ? where uId = ?', [cheatMethods, d, cheaterUId])
  .catch(e => next(e));

    res.json({
    error: 0,
    data: {
      userId,
      userVerifyCheaterId,
      createDatetime: d,
      cheatMethods,
    }
  })
});


module.exports = router;
