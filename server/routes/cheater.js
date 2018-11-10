const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');
const { baseDir } = require('../config');
const _ = require('underscore');
const path = require('path');
const { check, validationResult } = require('express-validator/check');

const { verifyJWTMiddleware, verifyPrivilegeMiddleware } = require('../middlewares/auth');
const db = require('../mysql');

const { verifyCatpcha } = require('../middlewares/captcha');
const { getCheatersDB } = require('../libs/misc');


const router = express.Router();

function addOneDay(str) {
  return moment(str).add(1, 'day').format('YYYY-MM-DD');
}

function capture(originId, cheaterUId) {
  // 抓取截图，并存入数据库
  // 有io 操作， 开另一个进程
  let o = {
    'bf1statsShot': `http://bf1stats.com/pc/${originId}`,
    'trackerShot': `https://battlefieldtracker.com/bf1/profile/pc/${originId}`,
    'trackerWeaponShot': `https://battlefieldtracker.com/bf1/profile/pc/${originId}/weapons`,
  };
  _.each(o, (v, k, obj) => {

    console.log(`start to cpature ${v} ...`);

    let cp = spawn('node', [
      path.resolve(baseDir, 'libs/webshot.js'),
      v,
    ]);

    let url;
    cp.stdout.on('data', (data) => {
      url = data.toString();
    });
    cp.on('close', (code) => {
      console.log(`cpature successfully ${k}, ${v}, ${url}`);

      db.query(`update cheaters set ${k} = ? where uId = ?`, [url, cheaterUId])
      .catch(e => next(e));
    })
  });
  // 抓取截图，并存入数据库
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
  } = req.query;
  let result;

  let [cdStart, cdEnd] = cd.split(',');
  let [udStart, udEnd] = ud.split(',');

  let statusQuery = '';
  let cdQuery = '';
  let udQuery = '';

  let queryVal = [];

  if (status && ['0', '1', '2', '3', '4', '5', '6'].indexOf(status) !== -1) {
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

  if (sort === '') sort = 'updateDatetime';

  let querySql = `select originId, status, cheatMethods, uId, createDatetime, updateDatetime 
    from ${getCheatersDB(game)} 
    where 1=1 ${statusQuery} ${cdQuery} ${udQuery} 
    order by ${sort} DESC `;

  result = await db.query(querySql + `limit 20 offset ${(page - 1) * 20}`, queryVal)
    .catch(e => next(e));

  const total = await db.query(querySql, queryVal)
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: result,
    game,
    total: total.length,
  });
});

// cheater detail
// report, verify, confirm
router.get('/:game/:uid', async (req, res, next) => {
  const cheaterUId = req.params.uid;
  const gameName = req.params.game;
  const cheater = await db.query(`select 
    id, originId, status, cheatMethods, bf1statsShot, trackerShot, trackerWeaponShot 
    from ${getCheatersDB(gameName)} 
    where uId = ?`,
    [cheaterUId])
    .catch(e => next(e));

  const reports = await db.query(`select a.userId, a.createDatetime, a.cheatMethods, a.bilibiliLink, a.description, b.username, b.uId, b.privilege 
    from user_report_cheater as a
    left join users as b 
    on a.userId = b.id
    where a.cheaterUId = ? and a.valid = "1"`, [cheaterUId])
    .catch(e => next(e));


  const verifies = await db.query(`select a.id, a.userId, a.createDatetime, a.status, a.suggestion, a.cheatMethods, b.username, b.uId, b.privilege 
    from user_verify_cheater as a 
    left join users as b 
    on a.userId = b.id
    where a.cheaterUId = ?`, [cheaterUId])
    .catch(e => next(e));

  const confirms = await db.query(`select t1.userId, t1.userVerifyCheaterId, t2.username, t2.uId, t2.privilege, t1.createDatetime, t3.cheatMethods 
    from user_confirm_verify as t1
    left join users as t2 on t1.userId = t2.id
    left join user_verify_cheater as t3 on t1.userVerifyCheaterId = t3.id
    where t3.cheaterUId = ?`, [cheaterUId])
    .catch(e => next(e));

  const replies = await db.query(`select t1.createDatetime, t3.username as foo, t3.uId as fooUId, t4.username as bar, t4.uId as barUId, t1.userId, t1.toFloor, t1.cheaterId, t1.content 
    from replies as t1
    left join ${getCheatersDB(gameName)} as t2 on t1.cheaterId = t2.id
    left join users as t3 on t1.userId = t3.id
    left join users as t4 on t1.toUserId = t4.id
    where t2.uId = ?`, [cheaterUId])
    .catch(e => next(e));

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
  check('gameName').not().isEmpty(),
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
    gameName, originId, cheatMethods, bilibiliLink, description,
  } = req.body;

  const cheatersDB = getCheatersDB(gameName);

  const { userId } = req.user;

  const re = await db.query(`select * from ${cheatersDB} where originId = ?`, [originId])
    .catch(e => next(e));

  let cheaterUId;

  const uuId = uuidv4();
  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  // 若第一次举报
  if (re.length === 0) {
    await db.query(`insert into ${cheatersDB} set ?`, {
      uId: uuId,
      originId,
      createDatetime: d,
    })
      .catch(e => next(e));

    cheaterUId = uuId;
  } else {
    // 若重复举报
    cheaterUId = re[0].uId;

    // 若 已经被石锤，不更新状态
    if (re[0].status !== '1') {
      await db.query(`update ${cheatersDB} set status = ? where uId = ?`, [0, cheaterUId])
      .catch(e => next(e));
    }
  }

  // 先暂停 截图功能，太耗cpu了，导致mysql都连接不上
  // capture(originId, cheaterUId);

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

  let { status, suggestion, cheatMethods = '', cheaterUId, gameName = '' } = req.body;

  const cheatersDB = getCheatersDB(gameName);

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
    status = '6';
  }

  await db.query(`update ${cheatersDB} set status = ?, updateDatetime = ? where uId = ? `, [status, d, cheaterUId])
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

  const { userId, userVerifyCheaterId, cheaterUId, cheatMethods, gameName = '' } = req.body;

  const cheatersDB = getCheatersDB(gameName);

  await db.query('insert into user_confirm_verify set ?', {
    userId,
    userVerifyCheaterId,
    createDatetime: d,
  })
  .catch(e => next(e));

  // 石锤的 第二个 步骤
  // update status, cheatMethods, updateDatetime
  await db.query(`update ${cheatersDB} set status = "1", cheatMethods = ?, updateDatetime = ? where uId = ?`, [cheatMethods, d, cheaterUId])
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

router.post('/reply', verifyJWTMiddleware, [
  check('gameName').not().isEmpty(),
  check('cheaterId').not().isEmpty().isInt(),
  check('userId').not().isEmpty().isInt(),
  check('content').not().isEmpty(),

  check('toUserId').optional().isInt(),
  check('toFloor').optional().isInt(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
    }

    const { gameName, cheaterId, userId, toUserId, content, toFloor } = req.body;
    const d = moment().format('YYYY-MM-DD HH:mm:ss');

    let values = {
      cheaterId,
      userId,
      content,
      createDatetime: d,
    };
    if (toUserId) {
      values['toUserId'] = toUserId;
    }
    if (toFloor) {
      values['toFloor'] = toFloor;
    }
    const result = await db.query('insert into replies set ?', values)
    .catch(e => next(e));

    const status = '5';
    await db.query(`update ${getCheatersDB(gameName)} set status = ?, updateDatetime = ? where id = ?`, [status, d, cheaterId])
    .catch(e=> next());

    res.json({
      error: 0,
      data: {
        createDatetime: d,
        content,
        status,
      }
    })
  });


module.exports = router;
