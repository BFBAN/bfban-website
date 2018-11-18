const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');
const _ = require('underscore');
const path = require('path');
const { check, validationResult } = require('express-validator/check');
const { baseDir } = require('../config');

const { verifyJWTMiddleware, verifyPrivilegeMiddleware } = require('../middlewares/auth');
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');
const { gamesArr, getDatetime, getDatetimeWithTZ, addOneDay, convertDatetimeToTimeZone } = require('../libs/misc');

const router = express.Router();

function datetimerangeToTimeZone(datetimerange, tz) {
  // receive string, return string
  return _.map(datetimerange.split(','), (v) => {
    if (v === '') {
      return ''
    } else {
      // convert client local timezone to server's timezone
      return convertDatetimeToTimeZone(v, tz)
    }
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

async function updateCommentsNum(uId) {
  await db.query(`update cheaters set commentsNum = (commentsNum+1) where uId = ?`, [uId])
}

// cheater list
// status
// 0=> 待处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的
// 不带 status 为 全部
// ?status=0
router.get('/', async (req, res, next) => {
  let {
    game = 'bf1',
    status = '',
    cd = ',',
    ud = ',',
    page = 1,
    sort = '',
    tz,
  } = req.query;
  let result;

  cd = datetimerangeToTimeZone(cd, tz);
  ud = datetimerangeToTimeZone(ud, tz);

  const [cdStart, cdEnd] = cd.split(',');
  const [udStart, udEnd] = ud.split(',');

  let gameQuery = '';
  let statusQuery = '';
  let cdQuery = '';
  let udQuery = '';

  const gameQueryVal = [],
    statusQueryVal = [] ,
    cdQueryVal = [],
    udQueryVal = [];

  if (game !== '') gameQuery = 'and game = ?';
  if (status && ['0', '1', '2', '3', '4', '5', '6'].indexOf(status) !== -1) statusQuery = 'and status = ?';
  if (cd && cd !== ',') cdQuery = 'and createDatetime >= ? and createDatetime <= ?';
  if (ud && ud !== ',') udQuery = 'and updateDatetime >= ? and updateDatetime <= ?';

  if (gameQuery) gameQueryVal.push(game);
  if (statusQuery) statusQueryVal.push(status);
  if (cdQuery) cdQueryVal.push(cdStart, addOneDay(cdEnd));
  if (udQuery) udQueryVal.push(udStart, addOneDay(udEnd));

  if (sort === '') sort = 'updateDatetime';

  const queryCondition = `where 1=1 ${gameQuery} ${statusQuery} ${cdQuery} ${udQuery}`;
  const queryOrder = `order by ${sort}`;
  const querySql = `select n, commentsNum, originId, status, cheatMethods, uId, createDatetime, updateDatetime
    from cheaters
    ${queryCondition}
    ${queryOrder}
    DESC
    `;

  result = await db.query(`${querySql} limit 20 offset ${(page - 1) * 20}`,
    [].concat(gameQueryVal, statusQueryVal, cdQueryVal, udQueryVal));

  const total = await db.query(`select count(id) as num
    from cheaters
    ${queryCondition}
    ${queryOrder}
    DESC
  `, [].concat(gameQueryVal, statusQueryVal, cdQueryVal, udQueryVal));

  const sumQuery = `
    select 
    status, count(id) as num
    from cheaters
    where 1=1 ${gameQuery} ${cdQuery} ${udQuery}
    group by status
  `;
  const sum = await db.query(sumQuery, [].concat(gameQueryVal, cdQueryVal, udQueryVal));

  const totalSumQuery = `
    select
    game, count(id) as num
    from cheaters
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
router.get('/:game/:uid', [
  check('game', 'game property incorrect').not().isEmpty().custom((val, {req}) => {return gamesArr.indexOf(val) !== -1}),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const cheaterUId = req.params.uid;
  const game = req.params.game;

  await db.query('update cheaters set `n` = (`n`+1) where game = ? and uId = ?', [game, cheaterUId]);

  const cheater = await db.query(`select
    id, n, originId, status, cheatMethods, bf1statsShot, trackerShot, trackerWeaponShot, avatarLink, commentsNum
    from cheaters
    where uId = ? and game = ?`,
  [cheaterUId, game]);

  const reports = await db.query(`select a.userId, a.createDatetime, a.cheatMethods, a.bilibiliLink, a.description, b.username, b.uId, b.privilege
    from user_report_cheater as a
    left join users as b
    on a.userId = b.id
    where a.cheaterUId = ? and a.valid = "1"`, [cheaterUId]);


  const verifies = await db.query(`select a.id, a.userId, a.createDatetime, a.status, a.suggestion, a.cheatMethods, b.username, b.uId, b.privilege
    from user_verify_cheater as a
    left join users as b
    on a.userId = b.id
    where a.cheaterUId = ?`, [cheaterUId]);

  const confirms = await db.query(`select t1.userId, t1.userVerifyCheaterId, t2.username, t2.uId, t2.privilege, t1.createDatetime, t3.cheatMethods
    from user_confirm_verify as t1
    left join users as t2 on t1.userId = t2.id
    left join user_verify_cheater as t3 on t1.userVerifyCheaterId = t3.id
    where t3.cheaterUId = ?`, [cheaterUId]);

  const replies = await db.query(`select
    t1.createDatetime, 
    t3.username as foo, t3.uId as fooUId, t3.privilege as fooPrivilege, 
    t4.username as bar, t4.uId as barUId, t4.privilege as barPrivilege, 
    t1.userId, t1.toFloor, t1.cheaterId, t1.content
    from replies as t1
    left join cheaters as t2 on t1.cheaterId = t2.id
    left join users as t3 on t1.userId = t3.id
    left join users as t4 on t1.toUserId = t4.id
    where t2.uId = ? and t2.game = ?`, [cheaterUId, game]);

  return res.json({
    error: 0,
    data: {
      cheater,
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
router.post('/', verifyJWTMiddleware, verifyCatpcha, [
  check('gameName', 'game property incorrect').not().isEmpty().custom((val, {req}) => {return gamesArr.indexOf(val) !== -1}),
  check('originId').not().isEmpty().isAscii(),
  check('cheatMethods').not().isEmpty(),
  check('bilibiliLink').optional({ checkFalsy: true }).isURL(),
  check('captcha').not().isEmpty().isLength({ min: 4, max: 4 }),
  check('description').not().isEmpty(),

  check('originUserId').not().isEmpty(),
  check('originPersonaId').not().isEmpty(),
  check('avatarLink').not().isEmpty(),
  ],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    gameName, originId, cheatMethods, bilibiliLink, description, originUserId, originPersonaId, avatarLink,
  } = req.body;

  const cheatersDB = 'cheaters';

  const { userId } = req.user;

  const re = await db.query(`select * from ${cheatersDB} where lower(originId) = ? and game = ?`, [originId.toLowerCase(), gameName]);

  let cheaterUId;

  const uuId = uuidv4();
  const d = getDatetime();

  try {
    // 若第一次举报
    if (re.length === 0) {
      await db.query(`insert into ${cheatersDB} set ?`, {
        uId: uuId,
        originId,
        createDatetime: d,
        updateDatetime: d,
        game: gameName,
        originUserId,
        originPersonaId,
        avatarLink,
      });

      cheaterUId = uuId;
    } else {
      // 若重复举报
      cheaterUId = re[0].uId;
      // todo: 若重复举报, update 最新游戏id, unshift 到首位 或 push 到末位，其余为 曾用名

      // 若 已经被石锤，不更新状态
      if (re[0].status !== '1') {
        await db.query(`update ${cheatersDB} set status = ?, updateDatetime = ? where uId = ?`, [0, d, cheaterUId]);
      }
    }

    // 先暂停 截图功能，太耗cpu了，导致mysql都连接不上
    // capture(originId, cheaterUId);

    await updateCommentsNum(cheaterUId);

    await db.query('insert into user_report_cheater set ?', {
      userId,
      cheaterUId,
      createDatetime: d,
      cheatMethods,
      bilibiliLink,
      description,
      // 每次举报拥有自己的举报 record
      cheaterGameName: originId,
    });

    res.json({
      error: 0,
      data: {
        cheaterUId,
      },
    });
  } catch (e) {
    next(e);
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
  check('suggestion').trim().not().isEmpty(),
  check('cheatMethods').optional({ checkFalsy: true }),
  check('cheaterUId').isUUID(),
],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: 'verify 请规范填写', errors: errors.array() });
  }

  let {
    status, suggestion, cheatMethods = '', cheaterUId, gameName = ''
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
      cheaterUId,
      cheatMethods,
      createDatetime: d,
    });

    if (status === '1') {
      status = '6';
    }

    await db.query(`update ${cheatersDB} set status = ?, updateDatetime = ? 
      where uId = ? `, [status, d, cheaterUId]);

    await updateCommentsNum(cheaterUId);

    const { username, userPrivilege } = req.user;
    return res.json({
      error: 0,
      data: {
        id: result.insertId,
        userId,
        cheaterUId,
        createDatetime: getDatetimeWithTZ(d),
        status,
        suggestion,
        cheatMethods,
        username,
        privilege: userPrivilege,
      },
    });
  } catch(e) {
    next(e);

    res.json({
      error: 1,
      msg: 'verify fail'
    });
  }

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

  const d = getDatetime();
  const {
    userId, userVerifyCheaterId, cheaterUId, cheatMethods, gameName = ''
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
    where uId = ?`, [cheatMethods, d, cheaterUId]);

    await updateCommentsNum(cheaterUId);

    res.json({
      error: 0,
      data: {
        userId,
        userVerifyCheaterId,
        createDatetime: getDatetimeWithTZ(d),
        cheatMethods,
      },
    });
  } catch(e) {
    next(e);

    res.json({
      error: 1,
      msg: 'confirm fail',
    });
  }

});

router.post('/reply', verifyJWTMiddleware, [
  check('gameName').not().isEmpty().custom((val, {req}) => {return ['bf1', 'bfv'].indexOf(val) !== -1}),
  check('cheaterId').not().isEmpty().isInt(),
  check('userId').not().isEmpty().isInt(),
  check('content').trim().not().isEmpty(),

  check('toUserId').optional().isInt(),
  check('toFloor').optional().isInt(),
],
async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    gameName, cheaterId, userId, toUserId, content, toFloor
  } = req.body;
  const d = getDatetime();

  const values = {
    cheaterId,
    userId,
    content,
    createDatetime: d,
  };
  if (toUserId) {
    values.toUserId = toUserId;
  }
  if (toFloor) {
    values.toFloor = toFloor;
  }

  try {
    const result = await db.query('insert into replies set ?', values);

    const re = await db.query(`select * from cheaters where id = ? and game = ?`, [cheaterId, gameName]);

    let status;
    if (re[0].status !== '1') {
      status = '5';
      await db.query(`update cheaters set status = ?, updateDatetime = ? where id = ? and game = ?`, [status, d, cheaterId, gameName]);
    } else {
      status = '1';
    }

    await updateCommentsNum(re[0].uId);

    res.json({
      error: 0,
      data: {
        createDatetime: getDatetimeWithTZ(d),
        content,
        status,
      },
    });
  }
  catch (e) {
    next(e);
    res.json({
      error: 1,
      msg: 'reply failed'
    })
  }

});


module.exports = router;
