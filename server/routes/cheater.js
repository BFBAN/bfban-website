const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const { check, validationResult } = require('express-validator/check');

const { verifyJWTMiddleware, verifyPrivilegeMiddleware } = require('../middlewares/auth');
const db = require('../mysql');

const router = express.Router();

// status
// 0=> 未处理，1=> 石锤，2=> 嫌疑玩家再观察，3=> 没有问题不是挂，4=> 捣乱的
// 不带 status 为 全部
// ?status=0
router.get('/', async (req, res, next) => {
  const { status } = req.query;

  if (typeof status !== 'undefined' && ['0', '1', '2', '3', '4'].indexOf(status) !== -1) {
    // status

    const result = await db.query('select origin_id, status, u_id from cheaters where status = ?', [status])
      .catch(e => next(e));

    return res.json({
      error: 0,
      data: result,
    });
  }
  const result = await db.query('select origin_id, status, u_id from cheaters')
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: result,
  });
});

// 具体的某个cheater
// who report
// who verify
router.get('/:uid', async (req, res, next) => {
  const cheaterUId = req.params.uid;
  const cheater = await db.query('select origin_id, status from cheaters where u_id = ?', [cheaterUId])
    .catch(e => next(e));

  const reports = await db.query('select a.create_datetime, a.cheat_methods, a.bilibili_link, a.description, b.username, b.privilege from user_report_cheater as a left join users as b on a.user_id = b.id where a.cheater_u_id = ?', [cheaterUId])
    .catch(e => next(e));


  const verifies = await db.query('select a.create_datetime, a.status, a.suggestion, b.username, b.privilege from user_verify_cheater as a left join users as b on a.user_id = b.id where a.cheater_u_id = ?', [cheaterUId])
    .catch(e => next(e));

  return res.json({
    error: 0,
    data: {
      cheater,
      reports,
      verifies,
    },
  });
});


// report cheater
// originId, cheatMethods, bilibiliLink, description
// insert user_report_cheater db
// userId, cheaterUId, datatime
router.post('/', verifyJWTMiddleware, [
  check('originId').not().isEmpty().isAscii(),
  check('cheatMethods').not().isEmpty(),
  check('bilibiliLink').optional({ checkFalsy: true }).isURL(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const {
    originId, cheatMethods, bilibiliLink, description,
  } = req.body;

  const { userId } = req.user;

  const re = await db.query('select * from cheaters where origin_id = ?', [originId])
    .catch(e => next(e));

  let cheaterUId;

  const uuId = uuidv4();

  // if not in db
  if (re.length === 0) {
    await db.query('insert into cheaters set ?', {
      u_id: uuId,
      origin_id: originId,
    })
      .catch(e => next(e));

    cheaterUId = uuId;
  } else {
    cheaterUId = re[0].u_id;
  }

  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    await db.query('insert into user_report_cheater set ?', {
      user_id: userId,
      cheater_u_id: cheaterUId,
      create_datetime: d,
      cheat_methods: cheatMethods,
      bilibili_link: bilibiliLink,
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

// insert user_verify_cheater db
// status, suggestion, userId, cheaterUId, datetime
router.post('/verify', verifyJWTMiddleware, verifyPrivilegeMiddleware, [
  check('status').not().isEmpty(),
  check('suggestion').not().isEmpty(),
  check('cheaterUId').isUUID(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ error: 1, msg: '请规范填写', errors: errors.array() });
  }

  const { status, suggestion, cheaterUId } = req.body;

  const { userId } = req.user;


  const d = moment().format('YYYY-MM-DD HH:mm:ss');

  await db.query('insert into user_verify_cheater set ? ', {
    status,
    suggestion,
    user_id: userId,
    cheater_u_id: cheaterUId,
    create_datetime: d,
  })
    .catch(e => next(e));

  await db.query('update cheaters set status = ? where u_id = ? ', [status, cheaterUId])
    .catch(e => next(e));

  const { username, userPrivilege } = req.user;
  return res.json({
    error: 0,
    data: {
      cheaterUId,
      create_datetime: d,
      status,
      suggestion,
      username,
      privilege: userPrivilege,
    },
  });
});


module.exports = router;
