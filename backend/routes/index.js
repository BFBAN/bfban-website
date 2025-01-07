"use strict";
import express from "express";

import {body as checkbody, query as checkquery, validationResult} from "express-validator";
import {Transform} from "stream";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import {allowPrivileges, forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {advSearchRateLimiter, normalSearchRateLimiter, statisticsLimiter} from "../middleware/rateLimiter.js";
import logger from "../logger.js";
import serviceApi, {ServiceApiError} from "../lib/serviceAPI.js";
import {pushOriginNameLog} from "./player.js";
import {getGravatarAvatar} from "../lib/gravatar.js";
import {achievementConfig, handleAchievemenMapToArray} from "./user_achievements.js";

const router = express.Router();

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     tags:
 *       - statistic
 *     summary: Get simple statistics
 *     description: Get statistics, support reports、players、confirmed、registers、banappeals、details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: reports
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: players
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: confirmed
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: registers
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: banAppeals
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: details
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: admins
 *         value: true
 *         in: query
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *       - name: from
 *         value: 0
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: statistics.ok
 *       400:
 *         description: statistics.bad
 */
router.get('/statistics', statisticsLimiter, [
        checkquery('from').optional().isInt({min: 0}),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);

            if (!validateErr.isEmpty()) {
                return res.status(400).json({error: 1, code: 'statistics.bad', message: validateErr.array()});
            }

            const from = typeof (req.query.from) === 'string' ? parseInt(req.query.from, 10) : 0;

            const queryPromises = [];

            if (req.query.reports) {
                const rawSQL = `
                    SELECT COUNT(id) AS reports
                    FROM comments
                    WHERE createTime >= ?
                    AND type = 'report'
                `;
                const params = [new Date(from).toISOString()]; // Ensure the date is in the correct format for SQL

                queryPromises.push(
                    db.raw(rawSQL, params)
                        .then(result => {
                            // Assuming the result structure follows what Knex typically returns for raw queries,
                            // you might need to adjust based on the actual structure.
                            const reportsCount = parseInt(result[0][0].reports);
                            return {reports: reportsCount};
                        })
                        .catch(error => console.error(error))
                );
            }
            if (req.query.players) {
                queryPromises.push(
                    db('players').count('id as count')
                        .where('createTime', '>=', from)
                        .andWhere({valid: 1})
                        .then(result => ({players: parseInt(result[0].count)}))
                );
            }
            if (req.query.confirmed) {
                queryPromises.push(
                    db('players').count('id as count')
                        .where('createTime', '>=', from)
                        .andWhere({status: 1, valid: 1})
                        .then(result => ({confirmed: parseInt(result[0].count)}))
                );
            }
            if (req.query.registers) {
                queryPromises.push(
                    db('users').count('id as count')
                        .where('createTime', '>=', new Date(from))
                        .then(results => ({registers: parseInt(results[0].count)}))
                );
            }
            if (req.query.admins) {
                queryPromises.push(
                    db('users').count('id as count')
                        .where('privilege', 'like', '%"admin"%')
                        .orWhere('privilege', 'like', '%"super"%')
                        .orWhere('privilege', 'like', '%"dev"%')
                        .orWhere('privilege', 'like', '%"root"%')
                        .then(results => ({admins: parseInt(results[0].count)}))
                );
            }
            if (req.query.banAppeals) {
                queryPromises.push(
                    db('comments').count('id as count')
                        .where('createTime', '>=', new Date(from))
                        .andWhere({type: 'banAppeal'})
                        .then(results => ({banAppeals: parseInt(results[0].count)}))
                );
            }

            // 并行执行所有查询
            const results = await Promise.all(queryPromises);
            // 使用reduce合并所有结果到单个对象
            const data = results.reduce((acc, result) => ({...acc, ...result}), {});

            res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({success: 1, code: 'statistics.ok', data: data});
        } catch (err) {
            next(err);
        }
    });

/**
 * active statistical
 */
router.get('/activeStatistical', [
        checkquery('isBot').optional().isBoolean(),
        checkquery('report').optional().isBoolean(),
        checkquery('community').optional().isBoolean(),
        checkquery('achievement').optional().isBoolean(),
        checkquery('limit').optional().isInt({min: 0}),
        checkquery('time').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'statistics.bad', message: validateErr.array()});
            const maxLimit = 3000;
            let {isBot = true, report = true, community = true, achievement = true, limit = maxLimit, time} = req.query;
            const times = {
                'daily': new Date(new Date().getTime() - 24 * 3600 * 1000),
                'weekly': new Date(new Date().getTime() - 7 * 24 * 3600 * 1000),
                'monthly': new Date(new Date().getTime() - 30 * 24 * 3600 * 1000),
                'yearly': new Date(new Date().getTime() - 360 * 24 * 3600 * 1000)
            }

            // 社区参与度
            // Community Engagement
            let data = {community: [], report: [], achievement: []};
            if (community) {
                let communityMap = {};
                let query = db('comments')
                    .join('users', 'comments.byUserId', 'users.id')
                    .select('comments.createTime', 'comments.content', 'comments.type', 'users.createTime', 'users.username', 'users.id')
                    .where('comments.createTime', '>=', times[req.query.time] || times.weekly)
                    .limit(time == 'yearly' ? maxLimit : limit);
                if (!isBot)
                    query = query.where('users.privilege', 'not like', '%"bot"%');
                let array = await query;

                for (const i of array) {
                    if (communityMap[i.id] != null) {
                        switch (array.type) {
                            case 'reply':
                            case 'report':
                                communityMap[i.id].total += .2
                                break;
                            case 'judgement':
                                communityMap[i.id].total += .5
                                break;
                            case 'banAppeal':
                                communityMap[i.id].total += 0
                                break;
                            default:
                                communityMap[i.id].total += .1
                                break;
                        }
                    } else communityMap[i.id] = {total: .1, id: i.id, username: i.username};
                }
                for (const i in communityMap) data.community.push(communityMap[i]);

                data.community = data.community.sort((a, b) => a.total - b.total).reverse().slice(0, 10)
            }

            // 举报统计
            if (report) {
                let reportMap = {};
                let reportQuery = db('comments')
                    .join('users', 'comments.byUserId', 'users.id')
                    .select('comments.createTime', 'comments.content', 'comments.type', 'users.createTime', 'users.username', 'users.id')
                    .where('comments.createTime', '>=', times[req.query.time] || times.weekly)
                    .andWhere('comments.type', 'report')
                    .limit(time == 'yearly' ? maxLimit : limit);
                if (!isBot)
                    reportQuery = query.where('users.privilege', 'not like', '%"bot"%');
                let reportArray = await reportQuery;

                for (const i of reportArray) {
                    if (reportMap[i.id] != null) reportMap[i.id].total += 1
                    else reportMap[i.id] = {total: 1, id: i.id, username: i.username};
                }
                for (const i in reportMap) data.report.push(reportMap[i]);

                data.report = data.report.sort((a, b) => a.total - b.total).reverse().slice(0, 10)
            }

            if (achievement) {
                let userQuery = db('users')
                    .select('users.username', 'users.id', 'users.attr')
                    .where('users.signoutTime', '>=', times.yearly)
                    .whereRaw("JSON_EXTRACT(attr, '$.achievements') IS NOT NULL")
                    .limit(maxLimit);

                let reportArray = await userQuery;

                // 对每个用户的成就进行排序
                for (let user of reportArray) {
                    if (user.attr && user.attr.achievements) {
                        var userPoints = 0;
                        handleAchievemenMapToArray(user.attr.achievements).sort((a, b) => {
                            // 使用成就的价值进行排序
                            let aValue = achievementConfig[a.name].points || 0;
                            let bValue = achievementConfig[b.name].points || 0;
                            userPoints += aValue;
                            return aValue - bValue;
                        }).reverse();
                        user.points = userPoints;
                        user.userAchievements = handleAchievemenMapToArray(user.attr.achievements);
                        delete user.attr;
                    }
                }

                data.achievement = reportArray.sort((a, b) => a.points - b.points).reverse().slice(0, 10);
            }

            res.status(200).json({success: 1, code: 'statistics.ok', data: data});
        } catch (err) {
            next(err);
        }
    });

/**
 * @swagger
 * /api/playerStatistics:
 *   post:
 *     tags:
 *       - statistic
 *     summary: Get game types, game cheating statistics
 *     description: Like graphql
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: true
 *             example:
 *               data: [{"game":"bf1","status":-1},{"game":"bfv","status":-1},{"game":"bf6","status":-1},{"game":"*","status":0},{"game":"*","status":5},{"game":"*","status":6},{"game":"*","status":1},{"game":"*","status":2},{"game":"*","status":3},{"game":"*","status":4},{"game":"*","status":8},{"game":"*","status":9}]
 *             properties:
 *               data:
 *                 type: array
 *     responses:
 *       200:
 *         description: playerStatistics.success
 *       400:
 *         description: playerStatistics.bad
 */
router.post('/playerStatistics', [  // like graphql :)
    checkbody('data').isArray({min: 0, max: 12}).custom((val) => {
        for (let i of val)
            if (!config.supportGames.concat('*').includes(i.game) || ![-1, 0, 1, 2, 3, 4, 5, 6, 8, 9].includes(i.status - 0))
                throw (new Error('bad subquery format'));
        return true;
    })
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'playerStatistics.bad', message: validateErr.array()});

        const data = [];
        for (let i of req.body.data) {
            if (i.status == 9) {
                const game = i.game === '*' ? '%' : `%"${i.game}"%`;
                const count = await db.count({num: 'id'}).from('players').where('valid', '=', 1)
                    .andWhere('games', 'like', game).andWhere('appealStatus', '=', "1").first().then(r => r.num);
                data.push({game: i.game, status: i.status, count});
            } else {
                const game = i.game === '*' ? '%' : `%"${i.game}"%`;
                const status = i.status === -1 ? '%' : i.status;
                const count = await db.count({num: 'id'}).from('players').where('valid', '=', 1)
                    .andWhere('games', 'like', game).andWhere('status', 'like', status).first().then(r => r.num);
                data.push({game: i.game, status: i.status, count});
            }
        }
        res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'playerStatistics.success',
            data: data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/activities:
 *   get:
 *     tags:
 *       - statistic
 *     summary: Get website updates
 *     description: Get the recent operation of the website, including registration, reports, complaints...
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: from
 *         description: The current time is not specified when the current time is queried.
 *         type:
 *           - integer
 *           - string
 *         format: date-time
 *       - name: limit
 *         type: integer
 *         value: 50
 *         minimum: 0
 *         maximim: 100
 *     responses:
 *       200:
 *         description: activities.ok
 */
router.get('/activities', [
    checkquery('from').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'activities.bad', message: validateErr.array()});

        const from = req.query.from ? new Date(req.query.from - 0) : new Date();
        const limit = req.query.limit ? req.query.limit - 0 : 100;

        const commentsRows = [
            'comments.id as id', 'users.username as byUserName', 'users.privilege as byUserPrivilege',
            'comments.byUserId as byUserId', 'comments.toPlayerId as toPlayerId',
            'comments.createTime as createTime'
        ];
        const toPlayerRows = [
            'players.originName as toPlayerName', 'players.originUserId as playerOriginUserId',
            'players.originPersonaId as playerOriginPersonaId', 'players.cheatMethods as playerCheatMethods',
            'players.avatarLink as playerAvatarLink', 'players.games as playerGames',
            'players.viewNum as playerViewNum', 'players.commentsNum as PlayerCommentsNum',
            'players.createTime as playerCreateTime', 'players.updateTime as playerUpdateTime'
        ];

        const registers = await db.select('id', 'username', 'privilege', 'createTime')
            .from('users').where('createTime', '<=', from)
            .orderBy('createTime', 'desc').limit(limit);

        const judgements = await db('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .join('players', 'comments.toPlayerId', 'players.id')
            .select(['comments.judgeAction as action'].concat(commentsRows, toPlayerRows))
            .where('comments.createTime', '<=', from).andWhere({type: 'judgement'})
            .orderBy('comments.createTime', 'desc').limit(limit);

        const reports = await db('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .join('players', 'comments.toPlayerId', 'players.id')
            .select(['comments.cheatGame as game'].concat(commentsRows, toPlayerRows))
            .where('comments.createTime', '<=', from).andWhere({type: 'report'})
            .orderBy('comments.createTime', 'desc').limit(limit);

        const banAppeals = await db('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .join('players', 'comments.toPlayerId', 'players.id')
            .select([].concat(commentsRows, toPlayerRows))
            .where('comments.createTime', '<=', from).andWhere({type: 'banAppeal'})
            .orderBy('comments.createTime', 'desc').limit(limit);

        let total = [].concat(registers.map(i => Object.assign(i, {type: 'register'})))
            .concat(judgements.map(i => Object.assign(i, {type: 'judgement'})))
            .concat(reports.map(i => Object.assign(i, {type: 'report'})))
            .concat(banAppeals.map(i => Object.assign(i, {type: 'banAppeal'})));
        total.sort((a, b) => {
            if (a.createTime > b.createTime)
                return -1;
            else
                return 1;
        });

        res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'activities.ok',
            data: total.slice(0, limit)
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/players/stream:
 *   get:
 *     security:
 *       - appToken: []
 *     tags:
 *       - player
 *     summary: Player list streaming BOT account used
 *     description: Mass player list data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: game
 *         in: query
 *         nullable: true
 *         example: all
 *         schema:
 *           type: string
 *           enum: ['all','bf1', 'bfv', 'bf6']
 *         description: >
 *           Sort order:
 *            * `all` - All
 *            * `bf1` - Battlefield 1
 *            * `bfv` - Battlefield 5
 *            * `bf6` - Battlefield 2024
 *       - name: status
 *         in: query
 *         example: -1
 *         schema:
 *           type: integer
 *           enum: [-1, 0, 1, 2, 3, 4, 5, 6, 8, 9]
 *         description: >
 *           Case status type
 *           Sort order:
 *            * `-1` - All
 *            * `0` - untreated
 *            * `1` - cheat
 *            * `2` - Pending self-proof
 *            * `3` - sinlessness
 *            * `4` - In vain
 *            * `5` - discuss
 *            * `6` - Wait for confirmation
 *            * `8` - Brush gun
 *            * `7` - null
 *            * `9` - appeal
 *       - name: sortBy
 *         in: query
 *         nullable: true
 *         example: commentsNum
 *         schema:
 *           type: string
 *           enum: ['createTime','updateTime','viewNum','commentsNum']
 *         description: >
 *           Sort order:
 *            * `createTime` - To create the time ranking
 *            * `updateTime` - Sort by update time
 *            * `viewNum` - Sort by preview number
 *            * `commentsNum` - Sort by number of comments
 *       - name: order
 *         description: Sequential mode
 *         type: string
 *         in: query
 *         nullable: true
 *         example: desc
 *         schema:
 *           type: string
 *           enum: ['desc','asc']
 *       - name: limit
 *         description: limit
 *         type: integer
 *         in: query
 *         value: 20
 *         minimum: 1
 *         maximum: 100
 *       - name: skip
 *         description: skip
 *         type: integer
 *         in: query
 *         value: 0
 *         minimum: 0
 *         example: 0
 *     responses:
 *       200:
 *         description: activities.ok
 *       400: players.bad
 */
router.get('/players/stream', verifyJWT, allowPrivileges(['bot', 'admin', 'super', 'root']), [
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('status').optional().isIn([-1, 0, 1, 2, 3, 4, 5, 6, 8, 9]),
    checkquery('sortBy').optional().isIn(['createTime', 'updateTime', 'viewNum', 'commentsNum']),
    checkquery('order').optional().isIn(['desc', 'asc']),
    checkquery('limit').optional().isInt({min: 0}),
    checkquery('skip').optional().isInt({min: 0})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async function (req, res, next) {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'players.bad', message: validateErr.array()});

        const game = (req.query.game && req.query.game !== 'all') ? req.query.game : '';
        const createTimeFrom = new Date(req.query.createTimeFrom || 0);
        const updateTimeFrom = new Date(req.query.updateTimeFrom || 0);
        const createTimeTo = new Date(req.query.createTimeTo || Date.now());
        const updateTimeTo = new Date(req.query.updateTimeTo || Date.now());
        const status = (req.query.status && req.query.status !== '-1') ? req.query.status : '%';
        const sort = req.query.sortBy ? req.query.sortBy : 'createTime';
        const order = req.query.order ? req.query.order : 'desc';
        const limit = req.query.limit ? req.query.limit - 0 : 20;
        const skip = req.query.skip ? req.query.skip - 0 : 0;

        const resultStream = db.select('*').from('players')
            .where('games', 'like', game ? `%"${game}"%` : "%").andWhere('valid', '=', 1)
            .andWhere('createTime', '>=', createTimeFrom).andWhere('updateTime', '>=', updateTimeFrom)
            .andWhere('createTime', '<=', createTimeTo).andWhere('updateTime', '<=', updateTimeTo)
            .andWhere('status', 'like', status)
            .orderBy(sort, order).offset(skip).limit(limit).stream();

        let first = true;
        const formatter = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                delete chunk.valid;
                let data;
                if (first)
                    data = '[' + JSON.stringify(chunk);
                else
                    data = ',' + JSON.stringify(chunk);
                first = false;
                callback(null, data);
            },
            flush(callback) {
                if (!first) {
                    callback(null, ']');
                } else {
                    callback(null, '[]');
                }
            }
        });
        req.on('close', () => {
            resultStream.end();
        });
        res.status(200).set('Content-Type', 'application/json');
        formatter.pipe(res);    // the pipeline will break express.Response's life cycle, then hanging the next request
        await misc.pipeline(resultStream, formatter).catch(err => {
            logger.error('/players/stream Stream error: ', err);
        });
        res.end();
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/players:
 *   get:
 *     tags:
 *       - statistic
 *     summary: Player list
 *     description: Get the player list
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: game
 *         in: query
 *         nullable: true
 *         example: all
 *         schema:
 *           type: string
 *           enum: ['all','bf1', 'bfv', 'bf6']
 *         description: >
 *           Sort order:
 *            * `all` - All
 *            * `bf1` - Battlefield 1
 *            * `bfv` - Battlefield 5
 *            * `bf6` - Battlefield 2024
 *       - name: createTimeFrom
 *         description: Report creation time
 *         type:
 *           - integer
 *           - string
 *         format: date-time
 *         in: query
 *       - name: updateTimeFrom
 *         description: Last updated time
 *         type:
 *           - integer
 *           - string
 *         format: date-time
 *         in: query
 *       - name: createTimeTo
 *         type:
 *           - integer
 *           - string
 *         format: date-time
 *         in: query
 *       - name: updateTimeTo
 *         type:
 *           - integer
 *           - string
 *         format: date-time
 *         in: query
 *       - name: status
 *         in: query
 *         example: -1
 *         schema:
 *           type: integer
 *           enum: [-1, 0, 1, 2, 3, 4, 5, 6, 8, 9]
 *         description: >
 *           Case status type
 *           Sort order:
 *            * `-1` - All
 *            * `0` - untreated
 *            * `1` - cheat
 *            * `2` - Pending self-proof
 *            * `3` - sinlessness
 *            * `4` - In vain
 *            * `5` - discuss
 *            * `6` - Wait for confirmation
 *            * `8` - Brush gun
 *            * `7` - null
 *            * `9` - appeal
 *       - name: sortBy
 *         in: query
 *         nullable: true
 *         example: commentsNum
 *         schema:
 *           type: string
 *           enum: ['createTime','updateTime','viewNum','commentsNum']
 *         description: >
 *           Sort order:
 *            * `createTime` - To create the time ranking
 *            * `updateTime` - Sort by update time
 *            * `viewNum` - Sort by preview number
 *            * `commentsNum` - Sort by number of comments
 *       - name: order
 *         description: Sequential mode
 *         type: string
 *         in: query
 *         nullable: true
 *         example: desc
 *         schema:
 *           type: string
 *           enum: ['desc','asc']
 *       - name: limit
 *         description: limit
 *         type: integer
 *         in: query
 *         value: 20
 *         minimum: 1
 *         maximum: 100
 *       - name: skip
 *         description: skip
 *         type: integer
 *         in: query
 *         value: 0
 *         minimum: 0
 *         example: 0
 *     responses:
 *       200:
 *         description: players.ok
 *       400:
 *         description: players.bad
 */
router.get('/players', [
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('createTimeFrom').optional().isInt({min: 0}),
    checkquery('updateTimeFrom').optional().isInt({min: 0}),
    checkquery('createTimeTo').optional().isInt({min: 0}),
    checkquery('updateTimeTo').optional().isInt({min: 0}),
    checkquery('status').optional().isIn([-1, 0, 1, 2, 3, 4, 5, 6, 8, 9]),
    checkquery('sortBy').optional().isIn(['createTime', 'updateTime', 'viewNum', 'commentsNum']),
    checkquery('order').optional().isIn(['desc', 'asc']),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('skip').optional().isInt({min: 0})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'players.bad', message: validateErr.array()});

        const game = (req.query.game && req.query.game !== 'all') ? req.query.game : '';
        const createTimeFrom = new Date(req.query.createTimeFrom ? req.query.createTimeFrom - 0 : 0);
        const updateTimeFrom = new Date(req.query.updateTimeFrom ? req.query.updateTimeFrom - 0 : 0);
        const createTimeTo = new Date(req.query.createTimeTo ? req.query.createTimeTo - 0 : Date.now());
        const updateTimeTo = new Date(req.query.updateTimeTo ? req.query.updateTimeTo - 0 : Date.now());
        const status = (req.query.status && req.query.status !== '-1') ? req.query.status : '%';
        const sort = req.query.sortBy ? req.query.sortBy : 'createTime';
        const order = req.query.order ? req.query.order : 'desc';
        const limit = req.query.limit ? req.query.limit - 0 : 20;
        const skip = req.query.skip ? req.query.skip - 0 : 0;
        if (status == 9) {
            const result = await db.select('*').from('players')
                .where('games', 'like', game ? `%"${game}"%` : "%").andWhere('valid', '=', 1)
                .andWhere('createTime', '>=', createTimeFrom).andWhere('updateTime', '>=', updateTimeFrom)
                .andWhere('createTime', '<=', createTimeTo).andWhere('updateTime', '<=', updateTimeTo)
                .andWhere('appealStatus', '=', '1')
                .orderBy(sort, order).offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.valid;
                    return i
                }));
            const total = await db('players').count({num: 'id'})
                .where('games', 'like', game ? `%"${game}"%` : "%").andWhere('valid', '=', 1)
                .andWhere('createTime', '>=', createTimeFrom).andWhere('updateTime', '>=', updateTimeFrom)
                .andWhere('createTime', '<=', createTimeTo).andWhere('updateTime', '<=', updateTimeTo)
                .andWhere('appealStatus', '=', '1').first().then(r => r.num);
            res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
                success: 1,
                code: 'players.ok',
                data: {result, total}
            });

        } else {
            const result = await db.select('*').from('players')
                .where('games', 'like', game ? `%"${game}"%` : "%").andWhere('valid', '=', 1)
                .andWhere('createTime', '>=', createTimeFrom).andWhere('updateTime', '>=', updateTimeFrom)
                .andWhere('createTime', '<=', createTimeTo).andWhere('updateTime', '<=', updateTimeTo)
                .andWhere('status', 'like', status)
                .orderBy(sort, order).offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.valid;
                    return i
                }));
            const total = await db('players').count({num: 'id'})
                .where('games', 'like', game ? `%"${game}"%` : "%").andWhere('valid', '=', 1)
                .andWhere('createTime', '>=', createTimeFrom).andWhere('updateTime', '>=', updateTimeFrom)
                .andWhere('createTime', '<=', createTimeTo).andWhere('updateTime', '<=', updateTimeTo)
                .andWhere('status', 'like', status).first().then(r => r.num);

            res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
                success: 1,
                code: 'players.ok',
                data: {result, total}
            });

        }
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/banAppeals:
 *   get:
 *     tags:
 *       - statistic
 *     summary: appeals list
 *     description: Get a list of complaints
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: game
 *         description: 游戏类型，['bf1', 'bfv', 'bf6']
 *         type: string
 *         in: query
 *         value: bf1
 *       - name: createTimeFrom
 *         type: integer
 *         in: query
 *         value: 0
 *       - name: createTimeTo
 *         type: integer
 *         in: query
 *         value: 0
 *       - name: status
 *         description: 案件状态类型
 *         type: integer
 *         in: query
 *         value: 0
 *       - name: order
 *         description: 顺序方式，['desc','asc']
 *         type: string
 *         in: query
 *         value: desc
 *     responses:
 *       200: activities.ok
 *       400: players.bad
 */
router.get('/banAppeals', [
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('createTimeFrom').optional().isInt({min: 0}),
    checkquery('createTimeTo').optional().isInt({min: 0}),
    checkquery('status').optional().isIn(['open', 'close', 'lock', 'all']),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('order').optional().isIn(['desc', 'asc'])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const game = (req.query.game && req.query.game !== 'all') ? req.query.game : '';
        const createTimeFrom = new Date(req.query.createTimeFrom ? req.query.createTimeFrom - 0 : 0);
        const createTimeTo = new Date(req.query.createTimeTo ? req.query.createTimeTo - 0 : Date.now());
        const status = req.query.status ? req.query.status === 'all' ? '%' : req.query.status : 'open';
        const limit = req.query.limit ? req.query.limit : 20;
        const skip = req.query.skip ? req.query.skip : 0;
        const order = req.query.order ? req.query.order : 'desc';

        const result = await db('comments').join('players', 'players.id', 'comments.toPlayerId')
            .select('players.*', 'comments.appealStatus', 'comments.createTime as appealTime', 'comments.byUserId')
            .distinct('players.id').where('comments.type', 'banAppeal')
            .andWhere('comments.appealStatus', 'like', status)
            .andWhere('players.games', 'like', game ? `%"${game}"%` : "%")
            .andWhere('comments.createTime', '>=', createTimeFrom)
            .andWhere('comments.createTime', '<=', createTimeTo)
            .andWhere('players.valid', '=', '1')
            .orderBy('appealTime', order).offset(skip).limit(limit)
            .then(r => r.map(i => {
                delete i.valid;
                return i
            }));

        const total = await db('comments').join('players', 'players.id', 'comments.toPlayerId')
            .countDistinct({num: 'toPlayerId'})
            .where('comments.type', 'banAppeal')
            .andWhere('comments.appealStatus', 'like', status)
            .andWhere('players.games', 'like', game ? `%"${game}"%` : "%")
            .andWhere('comments.createTime', '>=', createTimeFrom)
            .andWhere('comments.createTime', '<=', createTimeTo)
            .andWhere('players.valid', '=', '1')
            .first().then(r => r.num);

        res.status(200).json({success: 1, code: 'banAppeals.ok', data: {result, total}});
    } catch (err) {
        next(err);
    }
});

router.get('/admins', async (req, res, next) => {
    try {
        /** @type {import("../typedef.js").User[]} */
        let admins = await db.select('id', 'username', 'originName', 'originUserId', 'privilege').from('users')
            .where('privilege', 'like', '%"admin"%')
            .orWhere('privilege', 'like', '%"super"%')
            .orWhere('privilege', 'like', '%"dev"%')
            .orWhere('privilege', 'like', '%"root"%');
        admins.forEach(i => {
            if (!i.attr.showOrigin) {
                i.originUserId = null;
                i.originName = null;
            }
        });
        res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'getAdmins.success',
            data: admins
        });
    } catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags:
 *       - search
 *     description: Query and report player
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: type
 *         description: Search type, ['player', 'user', 'comment']
 *         type: string
 *         value: player
 *       - name: game
 *         type: string
 *         in: path
 *         value: bf1
 *       - name: gameSort
 *         description: Sort mode ['default', 'latest', 'mostViewed', 'mostComments', 'joinedAt', 'lastOnlineTime']
 *         type: string
 *         in: path
 *         value: default
 *       - name: param
 *         type: string
 *         value:
 *       - name: createTimeFrom
 *         description: Creation time, timestamp
 *         type: num
 *         in: path
 *         value: 1544313600000
 *       - name: createTimeTo
 *         description: End time, timestamp
 *         type: num
 *         in: path
 *         value: 1670544000000
 *     responses:
 *       200: search.success
 *       400: search.Bad
 */
router.get('/search', normalSearchRateLimiter, [
    checkquery('type').isIn(['player', 'user', 'comment']),
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('gameSort').optional().isIn(['default', 'latest', 'mostViewed', 'mostComments', 'joinedAt', 'lastOnlineTime']),
    checkquery('createTimeFrom').optional().isInt({min: 0}),
    checkquery('createTimeTo').optional().isInt({min: 0}),
    checkquery('param').trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 3, max: 100}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'search.bad', message: validateErr.array()});

        const type = req.query.type ? req.query.type : 'player';
        const gameSort = req.query.gameSort ? req.query.gameSort : 'default';
        const game = (req.query.game && req.query.game !== 'all') ? req.query.game : '';
        const createTimeFrom = new Date(req.query.createTimeFrom ? req.query.createTimeFrom - 0 : 0);
        const createTimeTo = new Date(req.query.createTimeTo ? req.query.createTimeTo - 0 : Date.now());
        const skip = req.query.skip ? req.query.skip : 0;
        const limit = req.query.limit ? req.query.limit : 20;
        const param = req.query.param;
        const result = {success: 1, code: 'search.success', data: [], total: 0};

        if (type === 'player') {
            const history = db('name_logs')
                    .join('players', 'name_logs.originUserId', 'players.originUserId')
                    .select('name_logs.originName as prevOriginName', 'players.*', 'name_logs.fromTime', 'name_logs.toTime')
                    .where('name_logs.originName', 'like', '%' + param + '%')
                    .andWhere('players.games', 'like', game ? `%"${game}"%` : "%")
                    .andWhere('players.createTime', '>=', createTimeFrom)
                    .andWhere('players.createTime', '<=', createTimeTo)
                    .andWhere({valid: 1}),
                playerArray = await history.offset(skip).limit(limit),
                playerTotal = await history.first().then(r => 1);

            result.data = playerArray.map(i => {
                return {
                    historyName: i.prevOriginName,
                    originName: i.originName,
                    dbId: i.id,
                    originUserId: i.originUserId,
                    originPersonaId: i.originPersonaId,
                    avatarLink: i.avatarLink,
                    status: i.status,
                    games: i.games,
                    cheatMethods: i.cheatMethods,
                    viewNum: i.viewNum,
                    commentsNum: i.commentsNum,
                    createTime: i.createTime,
                    updateTime: i.updateTime,
                    log: {from: i.fromTime, to: i.toTime},
                };
            }).sort((a, b) => {
                switch (gameSort) {
                    case 'latest':
                        return new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime();
                    case 'mostViewed':
                        return b.viewNum - a.viewNum;
                    case 'mostComments':
                        return b.commentsNum - a.commentsNum;
                    default:
                        return b.dbId - a.dbId;
                }
            })
            result.total = playerTotal;
        } else if (type === 'user') {
            const user = db('users')
                    .where('users.username', 'like', '%' + param + '%')
                    .andWhere('users.createTime', '>=', createTimeFrom)
                    .andWhere('users.createTime', '<=', createTimeTo)
                    .andWhere({valid: 1}),
                userArray = await user.offset(skip).limit(limit),
                userTotal = await user.first().then(r => 1);

            result.data = userArray.map(i => {
                return {
                    username: i.username,
                    dbId: i.id,
                    userAvatar: i.originEmail ? getGravatarAvatar(i.originEmail) : null,
                    joinTime: i.createTime,
                    updateTime: i.updateTime,
                    signoutTime: i.signoutTime,
                    privilege: i.privilege,
                };
            }).sort((a, b) => {
                switch (gameSort) {
                    case 'joinedAt':
                        return new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime();
                    case 'lastOnlineTime':
                        return new Date(a.signoutTime).getTime() - new Date(b.signoutTime).getTime();
                    default:
                        return a.dbId - b.dbId;
                }
            })

            result.total = userTotal;
        } else if (type === 'comment') {
            const comment = db('comments')
                    .join('users', 'users.id', 'comments.byUserId')
                    .select('comments.*', 'users.username', 'users.valid')
                    .where('comments.content', 'like', '%' + param + '%')
                    .andWhere('comments.videoLink', 'like', '%' + param + '%')
                    .andWhere('comments.createTime', '>=', createTimeFrom)
                    .andWhere('comments.createTime', '<=', createTimeTo)
                    .andWhere({"users.valid": 1}),
                commentArray = await comment.offset(skip).limit(limit),
                commentTotal = await comment.first().then(r => 1);

            result.data = commentArray;
            result.total = commentTotal;
        }

        if (result.data.length <= 0)
            return res.status(200).json(Object.assign(result, {message: 'search content not found'}));

        return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/advanceSearch:
 *   get:
 *     security:
 *       - appToken: []
 *     tags:
 *       - search
 *     description: Query players in advance, not the database but the EAdb
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: param
 *         in: path
 *         value:
 *     responses:
 *       200: advSearch
 *       400: advSearch.bad
 *       500: advanceSearch.error
 *       501: advSearch.bad
 */
router.get('/advanceSearch', verifyJWT, forbidPrivileges(['blacklisted', 'freezed']),
    advSearchRateLimiter.limiter([{roles: ['root', 'super', 'admin', 'dev'], value: 0}]), [
        checkquery('param').isAlphanumeric('en-US', {ignore: '-_'}).trim().isLength({min: 4, max: 32})
    ], /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)} */
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'advSearch.bad', message: validateErr.array()});

            const svResponses = await Promise.all([
                serviceApi('eaAPI', '/searchUsers').query({name: encodeURIComponent(req.query.param)}).get(),
                serviceApi('eaAPI', '/searchUsers').query({name: encodeURIComponent(req.query.param) + '*'}).get(),
            ]);
            /** @type {import("../typedef.js").EAUserInfo} */
            const exact = svResponses[0].data[0];
            /** @type {import("../typedef.js").EAUserInfo[]} */
            const similars = svResponses[1].data.filter(i => exact?.userId !== i.userId).slice(0, 10);

            const result = {success: 1, code: 'advanceSearch.ok', data: {}};
            if (exact) {
                const avatarRes = await serviceApi('eaAPI', '/userAvatar').query({userId: exact.userId}).get();
                /** @type {import("../typedef.js").Player} */
                const record = await db.select('*').from('players').where({
                    originUserId: exact.userId,
                    valid: 1
                }).first()
                    .then(r => {
                        if (r) delete r.valid;
                        return r;
                    });
                result.data.exact = {
                    originName: exact.name,
                    originPersonaId: exact.personaId,
                    originUserId: exact.userId,
                    avatarLink: avatarRes.data,
                    record: record,
                };
                pushOriginNameLog(exact.name, exact.userId, exact.personaId).catch(err => {
                    logger.warn('pushOriginNameLog: async error:', err.message, err.stack);
                });   // whether it has been reported or not, save the namelog anyway
            } else
                result.data.exact = null;
            if (similars) {
                /** @type {import("../typedef.js").Player[]} */
                const records = await db.select('*').from('players').whereIn('originUserId', similars.map(i => i.userId))
                    .then(rs => rs.map(i => {
                        delete i.valid;
                        return i;
                    }));
                result.data.similars = similars.map(i => {
                    pushOriginNameLog(i.name, i.userId, i.personaId).catch(err => {
                        logger.warn('pushOriginNameLog: async error:', err.message, err.stack);
                    });   // whether it has been reported or not, save the namelog anyway
                    return {
                        originName: i.name,
                        originPersonaId: i.personaId,
                        originUserId: i.userId,
                        record: records.find(j => j.originUserId === i.userId)
                    };
                });
            } else
                result.data.similars = [];

            return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json(result);
        } catch (err) {
            if (err instanceof ServiceApiError) {
                logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
                return res.status(err.statusCode === 501 ? 501 : 500).json({
                    error: 1,
                    code: err.statusCode === 501 ? 'advSearch.bad' : 'advanceSearch.error',
                    message: err.message
                });
            }
            next(err);
        }
    });

/**
 * @swagger
 * /api/siteStats:
 *   get:
 *     tags:
 *       - statistic
 *     description: Hot case
 *     produces:
 *       - application/json
 */
router.get('/trend', [
    checkquery('limit').optional().isInt({min: 1, max: 10}),
    checkquery('time').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'trend.bad', message: validateErr.array()});

        const time = {
            'daily': new Date(new Date().getTime() - 24 * 3600 * 1000),
            'weekly': new Date(new Date().getTime() - 7 * 24 * 3600 * 1000),
            'monthly': new Date(new Date().getTime() - 30 * 24 * 3600 * 1000),
            'yearly': new Date(new Date().getTime() - 360 * 24 * 3600 * 1000)
        }
        const limit = req.query.limit ? req.query.limit : 5;
        const result = await db.count({hot: 'tmp.id'}).select('players.*').from(function () {
            this.select('id', 'toPlayerId').from('comments').orderBy('id', 'desc').limit(200).as('tmp');
        }).join('players', 'tmp.toPlayerId', 'players.id')
            .where('createTime', '>=', time[req.query.time] || time.weekly)
            .groupBy('id')
            .orderBy('hot', 'desc')
            .limit(limit)
            .then(r => r.map(i => {
                delete i.valid;
                return i;
            }));
        return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'trend.ok',
            data: result
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/siteStats:
 *   get:
 *     tags:
 *       - statistic
 *     description: Website basic data statistics
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 */
const siteStatsCache = {data: undefined, time: new Date(0)};
router.get('/siteStats', async (req, res, next) => {
    try {
        if (siteStatsCache.data !== undefined && Date.now() - siteStatsCache.time.getTime() < 4 * 60 * 60 * 1000)   // cache for 4h
            return res.status(200).json({success: 1, code: 'siteStats.ok', data: siteStatsCache.data});
        const tbeg = new Date('2018-10-12T00:00:00.000Z');  // first commit of bfban
        const tnow = new Date();
        const period = 20;
        const slices = [...Array(period).keys()];   // like range(0, 20) in python

        const playerStats = await db('players').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
            .where('createTime', '<=', tbeg).andWhere({valid: 1})
            .unionAll(slices.map(i => {
                const t = new Date(Math.round(tbeg.getTime() + (tnow.getTime() - tbeg.getTime()) / period * (i + 1)));
                // caculate the time
                return db('players').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                    .where('createTime', '<=', t).andWhere({valid: 1});
            }));

        const confirmStats = await db('players').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
            .where('createTime', '<=', tbeg).andWhere({valid: 1, status: 1})
            .unionAll(slices.map(i => {
                const t = new Date(Math.round(tbeg.getTime() + (tnow.getTime() - tbeg.getTime()) / period * (i + 1)));

                return db('players').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                    .where('createTime', '<=', t).andWhere({valid: 1, status: 1});
            }));

        const userStats = await db('users').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
            .where('createTime', '<=', tbeg).andWhere({valid: 1})
            .unionAll(slices.map(i => {
                const t = new Date(Math.round(tbeg.getTime() + (tnow.getTime() - tbeg.getTime()) / period * (i + 1)));

                return db('users').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                    .where('createTime', '<=', t).andWhere({valid: 1});
            }));

        siteStatsCache.data = {playerStats, confirmStats, userStats};
        siteStatsCache.time = tnow;
        return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'siteStats.ok',
            data: {playerStats, confirmStats, userStats}
        });
    } catch (err) {
        next(err);
    }
})

export default router;
