"use strict";
import express from "express";
import db from "../mysql.js";
import config from "../config.js";
import fetch from 'node-fetch';
import logger from "../logger.js";

import {allowPrivileges, forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {body as checkbody, query as checkquery} from "express-validator/src/middlewares/validation-chain-builders.js";
import {validationResult} from "express-validator";
import {userSetAttributes} from "../lib/user.js";
import {getGravatarAvatar} from "../lib/gravatar.js";

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
    'user_innocent_case': {
        another: ['user_legal_case'],
        points: 0.5,
        async conditions(req, res, next) {
            const user = req.user;
            let player = await db.select('*').from('players').where({originUserId: user.originUserId}).first();
            if (!player) return false;
            return player && [3].lastIndexOf(player.status) >= 0;
        },
    },
    'old_user': {
        another: ['old_user'],
        rarity: "preciousness",
        points: 100,
        async conditions(req, res, next) {
            const user = req.user;
            return new Date(user.createTime).getDate() < new Date('2024 01-01').getTime() && user.id <= 10000;
        },
        end() {
        }
    },
    'trend_monthly_l1': {
        another: ['trend_monthly_l1'],
        points: 5,
        async conditions(req, res, next) {
            const user = req.user;
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=10&time=monthly`, {method: 'GET'}).then(res => res.json());
            return response.success === 1 && response.data.find(i => i.originUserId == user.originUserId && i.viewNum >= 100)
        },
    },
    'trend_monthly_l2': {
        another: ['trend_monthly_l2'],
        points: 5,
        async conditions(req, res, next) {
            const user = req.user;
            let response = await fetch(`http://${config.address}:${config.port}/api/trend?limit=10&time=monthly`, {method: 'GET'}).then(res => res.json());
            return response.success === 1 && response.data.find(i => i.originUserId == user.originUserId && i.hot >= 3 && i.viewNum >= 500)
        },
    },
    'user_achievement_l1': {
        another: ['user_achievement_l1'],
        points: 15,
        async conditions(req, res, next) {
            const user = req.user;
            return Object.keys(user.attr.achievements).length >= 3;
        },
    },
    'user_achievement_l2': {
        another: ['user_achievement_l2'],
        points: 15,
        async conditions(req, res, next) {
            const user = req.user;
            return Object.keys(user.attr.achievements).length >= 10;
        },
    },
    'user_achievement_l3': {
        another: ['user_achievement_l3'],
        points: 15,
        async conditions(req, res, next) {
            const user = req.user;
            let achievements = Object.keys(user.attr.achievements);
            let preciousnessCount = 0;
            achievements.forEach((currentValue) => {
                if (achievementConfig[currentValue].rarity == 'preciousness')
                    preciousnessCount += 1;
            })
            return achievements.length >= 10 && preciousnessCount >= 1;
        },
    },
    'user_achievement_l4': {
        another: ['user_achievement_l4'],
        points: 15,
        async conditions(req, res, next) {
            const user = req.user;
            let achievements = Object.keys(user.attr.achievements);
            let preciousnessCount = 0;
            achievements.forEach((currentValue) => {
                if (achievementConfig[currentValue].rarity == 'preciousness')
                    preciousnessCount += 1;
            })
            return achievements.length >= 15 && preciousnessCount >= 3;
        },
    },
    'active_community_weekly_l1': {
        another: ['active_community_weekly_l1'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/activeStatistical?isBot=false&time=weekly&community=true`, {method: 'GET'});
            let result = await response.json();
            if (result.error === 1 && result.data.community.length <= 0) return false;
            return result.data.community.find(i => i.id === req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'active_community_monthly_l1': {
        another: ['active_community_monthly_l1'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/activeStatistical?isBot=false&time=monthly&community=true`, {method: 'GET'});
            let result = await response.json();
            if (result.error === 1 && result.data.community.length <= 0) return false;
            return result.data.community.find(i => i.id === req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'active_community_monthly_l2': {
        another: ['active_community_monthly_l2'],
        points: 10,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/activeStatistical?isBot=false&time=monthly&community=true`, {method: 'GET'});
            let result = await response.json();
            if (result.error === 1 && result.data.community.length <= 0) return false;
            return result.data.community
                .splice(0, 3)
                .find(i => i.id === req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'active_community_yearly_l1': {
        another: ['active_community_yearly_l1'],
        points: 30,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/activeStatistical?isBot=false&time=yearly&community=true`, {method: 'GET'});
            let result = await response.json();
            if (result.error === 1 && result.data.community.length <= 0) return false;
            return result.data.community.find(i => i.id === req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0;
        },
    },
    'active_community_yearly_l2': {
        another: ['active_community_yearly_l2'],
        points: 60,
        async conditions(req, res, next) {
            let response = await fetch(`http://${config.address}:${config.port}/api/activeStatistical?isBot=false&time=yearly&community=true`, {method: 'GET'});
            let result = await response.json();
            if (result.error === 1 && result.data.community.length <= 0) return false;
            return result.data.community
                .splice(0, 3)
                .find(i => i.id === req.user.id) && req.user.privilege && req.user.privilege.indexOf('bot') <= 0 && req.user.attr.achievements['trend_yearly_l1'];
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
                .where({'comments.byUserId': user.id, type: 'report'})
                .andWhere('createTime', '>=', new Date('2024 01-01'))
                .first().then(r => r.num);

            const hammerReports = await db('comments')
                .count({num: 1})
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

/**
 * @swagger
 * /api/user/achievements:
 *  get:
 *     tags:
 *       - user
 *       - achievement
 *     summary: user Achievement list
 *     description: Get a list of current account achievements
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: achievements.success
 */
router.get('/achievements', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'achievement.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'achievement.notFound', message: 'no such user.'});

        const result = {
            userId: user.id,
            username: user.username,
            userAvatar: user.originEmail ? getGravatarAvatar(user.originEmail) : null,
            userAachievementExp: totalAachievementExp(user),
            isPublicAchievement: user.attr.showAchievement,
            achievements: handleAchievemenMapToArray(user.attr.achievements)
        };

        return res.status(200).json({success: 1, code: 'achievement.success', data: result});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/user/achievement:
 *   post:
 *     tags:
 *       - user
 *       - achievement
 *     summary: Get achievement
 *     description: Get achievements and check for eligibility
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: achievement key
 *         description: id
 *         required: true
 *         type: string
 *         value: old_user
 *     responses:
 *       200:
 *         description: achievement.success
 */
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
        if (achievementConfig[id].hasOwnProperty('end'))
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
        if (achievementConfig[achievementId].hasOwnProperty('end'))
            achievementConfig[achievementId].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});

router.post('/achievement/admin/delete', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('userId').optional().isInt({min: 0}),
    checkbody('achievementId')
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
        if (update.attr.achievements[achievementId]) {
            delete update.attr.achievements[achievementId];
            update.attr.achievements = {...update.attr.achievements};
        } else
            return res.status(403).json({error: 1, code: 'achievement.not', message: 'No such achievement'})

        update.attr = JSON.stringify(userSetAttributes(user.attr, update.attr, true));

        await db.from('users').update(update).where({id: userId || req.user.id});
        if (achievementConfig[achievementId].hasOwnProperty('end'))
            achievementConfig[achievementId].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});

function handleAchievemenMapToArray (achievements = {}) {
    return Object.entries(achievementConfig).map(([key, value]) => {
        if (achievements[key] && key && value)
            return {name: key, acquisitionTime: new Date(achievements[key]), points: achievementConfig[key].points || 0};
    }).filter(i => i != null);
}

function totalAachievementExp(user = {}) {
    let total = 0;
    let achievements = user.attr && Object.keys(user.attr.achievements) || [];

    achievements.forEach((i, index) => {
        if (achievementConfig[i])
            total += achievementConfig[i].points;
    })

    return total;
}

export {
    router,
    achievementConfig,
    totalAachievementExp,
    handleAchievemenMapToArray,
};
