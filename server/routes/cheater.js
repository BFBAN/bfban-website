const express = require('express');
const uuidv4 = require('uuid/v4');
const csrf = require('csurf');
const { spawn } = require('child_process');
const _ = require('underscore');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { baseDir } = require('../config');

const { verifyJWTMiddleware, verifyAdminPrivilegeMiddleware } = require('../middlewares/auth');
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');
const {
  gamesArr, getDatetime, getDatetimeWithTZ, addOneDay, convertDatetimeToTimeZone,
} = require('../libs/misc');
const { getUserInfo } = require('../libs/origin');

// csrf protection
const csrfProtection = csrf({ cookie: true });

const router = express.Router();

function datetimerangeToTimeZone(datetimerange, tz) {
  // receive string, return string
  return _.map(datetimerange.split(','), (v) => {
    if (v === '') {
      return '';
    }
    // convert client local timezone to server'preview.svg timezone
    return convertDatetimeToTimeZone(v, tz);
  }).join(',');
}

function capture(originId, cheaterUId) {
  // 抓取截图，并存入数据库
  // 有io 操作， 开另一个进程
  const o = {
    bf1statsShot: `http://bf1stats.com/pc/${originId}`,
    trackerShot: `https://battlefieldtracker.com/bf1/profile/pc/${originId}`,
    trackerWeaponShot: `https://battlefieldtracker.com/bf1/profile/pc/${originId}/weapons`,
  };
  _.each(o, (v, k, obj) => {
    console.log(`start to cpature ${v} ...`);

    const cp = spawn('node', [
      path.resolve(baseDir, 'libs/webshot.js'),
      v,
    ]);

    let url;
    cp.stdout.on('data', (data) => {
      url = data.toString();
    });
    cp.on('close', (code) => {
      console.log(`cpature successfully ${k}, ${v}, ${url}`);

      db.query(`update cheaters set ${k} = ?
      where uId = ?`, [url, cheaterUId]);
    });
  });
  // 抓取截图，并存入数据库
}

async function verifyGameIdComplete(req, res, next) {
  const {
    originId, originUserId, originPersonaId, avatarLink,
  } = req.body;

  try {
    const userInfo = await getUserInfo({ originId });

    if (userInfo.error) {
      return res.json({
        error: 1,
        msg: userInfo.error,
      });
    }

    if (userInfo.userId === originUserId
      && userInfo.personaId === originPersonaId
      && userInfo.avatarLink === avatarLink) {
      return next();
    }
    return res.json({
      error: 1,
      msg: 'verifyGameIdComplete not match',
    });
  } catch (e) {
    next(e);
    return res.json({
      error: 1,
      msg: e,
    });
  }
}

// ouid
async function updateCommentsNum(ouid) {
  await db.query('update cheaters set commentsNum = (commentsNum+1) where originUserId = ?', [ouid]);
}

// cheater list
// status
// 0=> 待处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的
// 不带 status 为 全部
// ?status=0
router.get('/', async (req, res, next) => {
  let {
    game = '',
    status = '',
    cd = ',',
    ud = ',',
    page = 1,
    sort = '',
    limit = 20,
    tz,
  } = req.query;

  cd = datetimerangeToTimeZone(cd, tz);
  ud = datetimerangeToTimeZone(ud, tz);

  const [cdStart, cdEnd] = cd.split(',');
  const [udStart, udEnd] = ud.split(',');

  let gameQuery = '';
  let statusQuery = '';
  let cdQuery = '';
  let udQuery = '';

  const gameQueryVal = [];
  const statusQueryVal = [];
  const cdQueryVal = [];
  const udQueryVal = [];

  if (game !== '') gameQuery = 'and cheater_game.game = ?';
  if (status && ['0', '1', '2', '3', '4', '5', '6'].indexOf(status) !== -1) statusQuery = 'and status = ?';
  if (cd && cd !== ',') cdQuery = 'and createDatetime >= ? and createDatetime <= ?';
  if (ud && ud !== ',') udQuery = 'and updateDatetime >= ? and updateDatetime <= ?';

  if (gameQuery) gameQueryVal.push(game);
  if (statusQuery) statusQueryVal.push(status);
  if (cdQuery) cdQueryVal.push(cdStart, addOneDay(cdEnd));
  if (udQuery) udQueryVal.push(udStart, addOneDay(udEnd));

  if (sort === '') sort = 'updateDatetime';

  const commonCondition = '1=1 and valid = \'1\'';

  const queryCondition = `where ${commonCondition} ${gameQuery} ${statusQuery} ${cdQuery} ${udQuery}`;
  const queryOrder = `order by ${sort}`;
  const querySql = `select cheaters.id, originUserId, n, commentsNum, avatarLink, originId, status, cheatMethods, uId, createDatetime, updateDatetime
    from cheaters
    inner join cheater_game on cheaters.originUserId = cheater_game.ouid
    ${queryCondition}
    ${queryOrder}
    DESC
    `;

  const result = await db.query(`${querySql} limit ${limit} offset ${(page - 1) * limit}`,
    [].concat(gameQueryVal, statusQueryVal, cdQueryVal, udQueryVal));

  const total = await db.query(`select count(cheaters.id) as num
    from cheaters
    left join cheater_game on cheaters.originUserId = cheater_game.ouid
    ${queryCondition}
    ${queryOrder}
    DESC
  `, [].concat(gameQueryVal, statusQueryVal, cdQueryVal, udQueryVal));

  const sumQuery = `
    select
    status, count(cheaters.id) as num
    from cheaters
    left join cheater_game on cheaters.originUserId = cheater_game.ouid
    where ${commonCondition} ${gameQuery} ${cdQuery} ${udQuery}
    group by status
  `;
  const sum = await db.query(sumQuery, [].concat(gameQueryVal, cdQueryVal, udQueryVal));

  const totalSumQuery = `
    select
    cheater_game.game, count(cheaters.id) as num
    from cheaters
    left join cheater_game on cheaters.originUserId = cheater_game.ouid
    where ${commonCondition}
    group by game
  `;
  const totalSum = await db.query(totalSumQuery);

  return res.json({
    error: 0,
    data: result,
    game,
    total: total[0].num,
    sum,
    totalSum,
  });
});

// cheater detail
// report, verify, confirm
router.get('/:ouid', [
  check('ouid').not().isEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const cheaterOUId = req.params.ouid;

  await db.query('update cheaters set `n` = (`n`+1) where originUserId = ?', [cheaterOUId]);

  const cheater = await db.query(`select
    id, n, originId, status, cheatMethods, bf1statsShot, trackerShot, trackerWeaponShot, avatarLink, commentsNum, createDatetime, updateDatetime, originUserId
    from cheaters
    where originUserId = ? and valid='1'`,
  [cheaterOUId]);

  const games = await db.query('select game from cheater_game where ouid = ?', [cheaterOUId]);

  // 历史id
  const origins = await db.query('select * from origin where originUserId = ?', [cheaterOUId]);

  const reports = await db.query(`select a.userId, a.game, a.cheaterGameName, a.originUserId, a.createDatetime, a.cheatMethods, a.bilibiliLink, a.description, b.username, b.uId, b.privilege
    from user_report_cheater as a
    left join users as b
    on a.userId = b.id
    where a.originUserId = ? and a.valid = "1"`, [cheaterOUId]);


  const verifies = await db.query(`select a.id, a.userId, a.createDatetime, a.status, a.suggestion, a.cheatMethods, b.username, b.uId, b.privilege
    from user_verify_cheater as a
    left join users as b
    on a.userId = b.id
    where a.originUserId = ? and a.valid = '1'`, [cheaterOUId]);

  const confirms = await db.query(`select t1.userId, t1.userVerifyCheaterId, t2.username, t2.uId, t2.privilege, t1.createDatetime, t3.cheatMethods
    from user_confirm_verify as t1
    left join users as t2 on t1.userId = t2.id
    left join user_verify_cheater as t3 on t1.userVerifyCheaterId = t3.id
    where t3.originUserId = ? and t3.valid = '1'`, [cheaterOUId]);

  const replies = await db.query(`select
    t1.createDatetime,
    t3.username as foo, t3.uId as fooUId, t3.privilege as fooPrivilege,
    t4.username as bar, t4.uId as barUId, t4.privilege as barPrivilege,
    t1.userId, t1.toFloor, t1.cheaterId, t1.content
    from replies as t1
    left join cheaters as t2 on t1.cheaterId = t2.id
    left join users as t3 on t1.userId = t3.id
    left join users as t4 on t1.toUserId = t4.id
    where t2.originUserId = ? and t1.valid = '1'`, [cheaterOUId]);

  return res.json({
    error: 0,
    data: {
      cheater,
      games,
      origins,
      reports,
      verifies,
      confirms,
      replies,
    },
  });
});

// report cheater
// originId, cheatMethods, bilibiliLink, description
// insert user_report_cheater db
// userId, cheaterUId, datatime
router.post('/', verifyJWTMiddleware, [
  check('gameName', 'game property incorrect').not().isEmpty().custom((val, { req }) => gamesArr.indexOf(val) !== -1),
  check('originId').not().isEmpty().isAscii(),
  check('cheatMethods').not().isEmpty(),
  check('bilibiliLink').optional({ checkFalsy: true }).isURL({allow_protocol_relative_urls: true}),
  // check('captcha').not().isEmpty().isLength({ min: 4, max: 4 }),
  check('description').not().isEmpty(),

  check('originUserId').not().isEmpty(),
  check('originPersonaId').not().isEmpty(),
  check('avatarLink').not().isEmpty(),
],
// 二次确认 originUserId, originPersonaId 与 EAID 无误
verifyGameIdComplete,
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    gameName, originId, cheatMethods, bilibiliLink, description, originUserId,
    originPersonaId, avatarLink,
  } = req.body;

  const { userId } = req.user;

  const re = await db.query('select * from cheaters where originUserId = ?', [originUserId]);

  const d = getDatetime();

  try {
    // 若第一次举报
    if (re.length === 0) {
      await db.query('insert into cheaters set ?', {
        originId,
        createDatetime: d,
        updateDatetime: d,

        originUserId,
        originPersonaId,
        avatarLink,
      });
    } else {
      // 若重复举报, update 最新游戏id 和 updateDatetime
      await db.query('update cheaters set originId = ?, updateDatetime = ? where originUserId = ?', [originId, d, originUserId]);

      // 若 已经被石锤，不更新状态
      if (re[0].status !== '1') {
        await db.query('update cheaters set status = ?, updateDatetime = ? where originUserId = ?', [0, d, originUserId]);
      }
    }

    const tmpRe = await db.query('select game from cheater_game where ouid = ? and game = ?', [originUserId, gameName]);
    if (tmpRe.length === 0) {
      await db.query('insert into cheater_game set ?', {
        ouid: originUserId,
        game: gameName,
      });
    }

    // insert origin history
    await db.query('insert into origin set ?', {
      originUserId,
      cheaterGameName: originId,
      createDatetime: d,
    });

    // 先暂停 截图功能，太耗cpu了，导致mysql都连接不上
    // capture(originId, cheaterUId);

    await updateCommentsNum(originUserId);

    await db.query('insert into user_report_cheater set ?', {
      userId,
      createDatetime: d,
      cheatMethods,
      bilibiliLink,
      description,

      // 每次举报拥有自己的举报 record
      cheaterGameName: originId,
      originUserId,
      game: gameName,
    });

    return res.json({
      error: 0,
      data: {
        originUserId,
      },
    });
  } catch (e) {
    next(e);
    return res.json({
      error: 1,
      msg: 'report failed',
    });
  }
});

// get cheater status
router.post('/status', async (req, res, next) => {
  const { originUserId } = req.body;

  const result = await db.query('select status from cheaters where originUserId = ?', [originUserId]);

  const exist = result.length !== 0;
  if (exist) {
    return res.json({
      error: 0,
      status: result[0].status,
    });
  }
  return res.json({
    error: 1,
    msg: 'not found',
  });
});

// verify cheater
// status, suggestion, userId, datetime
router.post('/verify', verifyJWTMiddleware, verifyAdminPrivilegeMiddleware, [
  check('status').not().isEmpty(),
  check('suggestion').trim().not().isEmpty(),
  // check('cheatMethods').optional({ checkFalsy: true }),
  // check('cheaterUId').isUUID(),
  check('originUserId').not().isEmpty(),
],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'verify 请规范填写', errors: errors.array() });
  }

  let {
    status, suggestion, cheatMethods = '', originUserId,
  } = req.body;

  const cheatersDB = 'cheaters';

  const { userId } = req.user;

  if (status !== '1') {
    cheatMethods = '';
  }

  const d = getDatetime();

  try {
    const result = await db.query('insert into user_verify_cheater set ? ', {
      status,
      suggestion,
      userId,
      cheatMethods,
      createDatetime: d,
      originUserId,
    });

    if (status === '1') {
      status = '6';

      // if usper, status 1 instantly
      if (req.user.userPrivilege === 'super') {
        status = '1';
      }
    }

    await db.query(`update ${cheatersDB} set status = ?, updateDatetime = ?
      where originUserId = ? `, [status, d, originUserId]);

    await updateCommentsNum(originUserId);

    const { username, userPrivilege } = req.user;
    return res.json({
      error: 0,
      data: {
        id: result.insertId,
        userId,
        originUserId,
        createDatetime: getDatetimeWithTZ(d),
        status,
        suggestion,
        cheatMethods,
        username,
        privilege: userPrivilege,
      },
    });
  } catch (e) {
    next(e);

    return res.json({
      error: 1,
      msg: 'verify fail',
    });
  }
});

// confirm cheater
router.post('/confirm', verifyJWTMiddleware, verifyAdminPrivilegeMiddleware, [
  check('userId').not().isEmpty(),
  check('userVerifyCheaterId').not().isEmpty(),
  check('cheatMethods').not().isEmpty(),
],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'confirm 请规范', errors: errors.array() });
  }

  const d = getDatetime();
  const {
    userId, userVerifyCheaterId, cheatMethods, originUserId,
  } = req.body;

  const cheatersDB = 'cheaters';

  try {
    await db.query('insert into user_confirm_verify set ?', {
      userId,
      userVerifyCheaterId,
      createDatetime: d,
    });

    // 石锤的 第二个 步骤
    // update status, cheatMethods, updateDatetime
    await db.query(`update ${cheatersDB} set status = "1", cheatMethods = ?, updateDatetime = ?
    where originUserId = ?`, [cheatMethods, d, originUserId]);

    await updateCommentsNum(originUserId);

    return res.json({
      error: 0,
      data: {
        userId,
        userVerifyCheaterId,
        createDatetime: getDatetimeWithTZ(d),
        cheatMethods,
      },
    });
  } catch (e) {
    next(e);

    return res.json({
      error: 1,
      msg: 'confirm fail',
    });
  }
});

router.post('/reply', verifyJWTMiddleware, [
  check('cheaterId').not().isEmpty().isInt(),
  check('userId').not().isEmpty().isInt(),
  check('content').trim().not().isEmpty(),
  check('originUserId').not().isEmpty(),

  check('toUserId').optional().isInt(),
  check('toFloor').optional().isInt(),
],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    cheaterId, userId, toUserId, content, toFloor, originUserId,
  } = req.body;
  const d = getDatetime();

  const values = {
    cheaterId,
    userId,
    content,
    createDatetime: d,
    originUserId,
  };
  if (toUserId) {
    values.toUserId = toUserId;
  }
  if (toFloor) {
    values.toFloor = toFloor;
  }

  try {
    const result = await db.query('insert into replies set ?', values);

    const re = await db.query('select * from cheaters where id = ?', [cheaterId]);

    let status;
    if (re[0].status !== '1') {
      status = '5';
    } else {
      status = '1';
    }

    // update udpateDatetime
    await db.query('update cheaters set status = ?, updateDatetime = ? where id = ?', [status, d, cheaterId]);

    await updateCommentsNum(re[0].originUserId);

    return res.json({
      error: 0,
      data: {
        createDatetime: getDatetimeWithTZ(d),
        content,
        status,
      },
    });
  } catch (e) {
    next(e);
    return res.json({
      error: 1,
      msg: 'reply failed',
    });
  }
});

// need sign in
router.post('/updateCheaterInfo', [
  check('originUserId').not().isEmpty(),
], verifyJWTMiddleware, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'verify 请规范填写', errors: errors.array() });
  }

  const { originUserId } = req.body;
  try {
    const userInfo = await getUserInfo({ userpid: originUserId });

    if (userInfo.error) {
      return res.json({
        error: 1,
        msg: userInfo.error,
      });
    }

    const d = getDatetime();
    const originData = {
      originUserId,
      cheaterGameName: userInfo.EAID,
      createDatetime: d,
    };
    await db.query('insert into origin set ?', originData);
    await db.query('update cheaters set originId = ?, avatarLink = ?, updateDatetime = ? where originUserId = ?', [userInfo.EAID, userInfo.avatarLink, d, originUserId]);

    return res.json({
      error: 0,
      data: {
        origin: Object.assign(originData, { avatarLink: userInfo.avatarLink }),
      },
    });
  } catch (e) {
    next(e);
    return res.json({
      error: 1,
      msg: e,
    });
  }
});


module.exports = router;
