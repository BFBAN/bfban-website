import {allowPrivileges, forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {body as checkbody, query as checkquery} from "express-validator/src/middlewares/validation-chain-builders.js";
import {validationResult} from "express-validator";
import db from "../mysql.js";
import express from "express";
import {userSetAttributes} from "../lib/user.js";
import config from "../config.js";
import fetch from 'node-fetch';

const router = express.Router();
const achievementConfig = {
    'open_chat_l1': {
        another: ['open_chat', 'open_chat_l1'],
        points: 0.5,
        async conditions(req, res, next) {
            return req.user.attr && req.user.attr.allowDM;
        },
    },
    'open_chat_l2': {
        another: ['open_chat_l2'],
        points: 5,
        async conditions(req, res, next) {
            let oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            let message = await db.from('messages')
                .where({toUserId: req.user.id, type: 'direct', haveRead: 1})
                .andWhere('createTime', '>=', oneMonthAgo);

            return req.user.attr && req.user.attr.allowDM && message.length > 0 && req.user.attr.achievements['open_chat_l1'];
        },
    },
    'one_search_player': {
        another: ['one_search_player'],
        points: 0.5,
        conditions: (req, res, next) => true,
    },
    'old_user': {
        another: ['old_user'],
        points: 10,
        async conditions(req, res, next) {
            const user = req.user;
            return new Date(user.createTime).getDate() < new Date('2024 01-01').getTime() && user.id <= 10000;
        },
        end() {
        }
    },
    'trend_weekly_l1': {
        another: ['trend_weekly_l1'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=10&time=weekly`, {method: 'GET'});
            let result = await response.json();
            if (result.error == 1 && result.data.length <= 0) return false;
            return result.data.find(i => i.id == req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'trend_monthly_l1': {
        another: ['trend_monthly_l1'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=10&time=monthly`, {method: 'GET'});
            let result = await response.json();
            if (result.error == 1 && result.data.length <= 0) return false;
            return result.data.find(i => i.id == req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'trend_monthly_l2': {
        another: ['trend_monthly_l2'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=3&time=monthly`, {method: 'GET'});
            let result = await response.json();
            if (result.error == 1 && result.data.length <= 0) return false;
            return result.data.find(i => i.id == req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'trend_yearly_l1': {
        another: ['trend_yearly_l1'],
        points: 30,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=10&time=yearly`, {method: 'GET'});
            let result = await response.json();
            if (result.error == 1 && result.data.length <= 0) return false;
            return result.data.find(i => i.id == req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'trend_yearly_l2': {
        another: ['trend_yearly_l2'],
        points: 60,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=3&time=yearly`, {method: 'GET'});
            let result = await response.json();
            if (result.error == 1 && result.data.length <= 0) return false;
            return result.data.find(i => i.id == req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0 && req.user.attr.achievements['trend_yearly_l1'];
        },
    },
    'report_l1': {
        another: ['report_l1'],
        points: 10,
        async conditions(req, res, next) {
            const user = req.user;
            const reports = await db('comments').count({num: 1})
                .where({'comments.byUserId': user.id, 'comments.type': 'report'})
                .andWhere('comments.createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);
            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return reports >= 10;
        }
    },
    'report_l2': {
        another: ['report_l2'],
        points: 20,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments')
                .count({num: 1})
                .distinct('comments.toPlayerId')
                .where({'comments.byUserId': user.id, type: 'report'})
                .andWhere('createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            const hammerReports = await db('comments')
                .count({num: 1})
                .distinct('comments.toPlayerId')
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, type: 'comments.report', 'players.status': 1})
                .andWhere('comments.createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 100 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l1'];
        }
    },
    'report_l3': {
        another: ['report_l3'],
        points: 30,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .andWhere('createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            const hammerReports = await db('comments').join('players')
                .count({num: 1})
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, 'comments.type': 'report', 'players.status': 1})
                .andWhere('comments.createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 300 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l2'];
        }
    },
    'report_l4': {
        another: ['report_l4'],
        points: 50,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .andWhere('createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            const hammerReports = await db('comments')
                .join('players')
                .count({num: 1})
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, 'comments.type': 'report', 'players.status': 1})
                .andWhere('comments.createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 1000 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l3'];
        }
    },
    'report_l5': {
        another: ['report_l5'],
        points: 70,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments')
                .count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .andWhere('createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            const hammerReports = await db('comments').count({num: 1})
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, 'comments.type': 'report', 'players.status': 1})
                .andWhere('comments.createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 5000 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l4'];
        }
    }
}

router.get('/achievements', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'achievement.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'achievement.notFound', message: 'no such user.'});

        var result = {
            id: user.id,
            achievements: user.attr.achievements || {}
        };

        return res.status(200).json({success: 1, code: 'achievement.success', data: result});
    } catch (err) {
        next(err);
    }
});

router.post('/achievement', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkbody('id').isIn(Object.keys(achievementConfig)),
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'achievement.bad', message: validateErr.array()});
        const {id} = req.body;

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'achievement.notFound', message: 'no such user.'});

        let update = {attr: {...user.attr}};
        if (achievementConfig[id] && req.user.attr.achievements && req.user.attr.achievements[id])
            return res.status(403).json({
                error: 1,
                code: 'achievement.duplicate',
                message: 'this achievement has been added'
            })
        else if (achievementConfig[id] && achievementConfig[id].conditions && await achievementConfig[id].conditions(req, res, next))
            update.attr.achievements = {...user.attr.achievements || {}, [id]: new Date().getTime()};
        else if (achievementConfig[id] && achievementConfig[id].conditions && !await achievementConfig[id].conditions(req, res, next))
            return res.status(403).json({
                error: 1,
                code: 'achievement.notConditions',
                message: 'the acquisition conditions are not met'
            })
        else
            return res.status(403).json({error: 1, code: 'achievement.ineffective', message: 'no such achievement'})

        update.attr = JSON.stringify(userSetAttributes(req.user.attr, update.attr));

        await db.from('users').update(update).where({id: req.user.id});
        if (achievementConfig[id].end)
            achievementConfig[id].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});

router.post('/achievement/admin/add', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('userId').optional().isInt({min: 0}),
    checkbody('achievementId').isIn(Object.keys(achievementConfig))
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'achievement.bad', message: validateErr.array()});
        const {userId, achievementId} = req.body;

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: userId || req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'achievement.notFound', message: 'no such user.'});

        let update = {attr: {...user.attr}};
        update.attr.achievements = {...user.attr.achievements, [achievementId]: new Date().getDate()};
        update.attr = JSON.stringify(userSetAttributes(req.user.attr, update.attr, true));

        await db.from('users').update(update).where({id: userId || user.id});
        if (achievementConfig[achievementId].end)
            achievementConfig[achievementId].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});

router.post('/achievement/admin/delete', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('userId').optional().isInt({min: 0}),
    checkbody('achievementId').isIn(Object.keys(achievementConfig))
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'achievement.bad', message: validateErr.array()});
        const {userId, achievementId} = req.body;

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: userId || req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'achievement.notFound', message: 'no such user.'});

        let update = {attr: {...user.attr}}
        let attr = {};
        if (achievementConfig[achievementId]) {
            delete req.user.attr.achievements[achievementId];
            attr.achievements = {...req.user.attr.achievements};
        } else
            return res.status(403).json({error: 1, code: 'achievement.not', message: 'No such achievement'})

        update.attr = JSON.stringify(userSetAttributes(req.user.attr, attr, true));

        await db.from('users').update(update).where({id: userId || req.user.id});
        if (achievementConfig[achievementId].end)
            achievementConfig[achievementId].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});


export default router;
