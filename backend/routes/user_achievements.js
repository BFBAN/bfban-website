import {allowPrivileges, forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {body as checkbody, query as checkquery} from "express-validator/src/middlewares/validation-chain-builders.js";
import {validationResult} from "express-validator";
import db from "../mysql.js";
import express from "express";
import {userSetAttributes} from "../lib/user.js";
import config from "../config.js";

const router = express.Router();
const achievementConfig = {
    'old_user': {
        another: ['old_user'],
        points: 10,
        async conditions(req, res, next) {
            const user = req.user;
            return new Date(user.createTime).getDate() <= new Date('2020 01-01').getTime() || req.user.dbId <= 1000;
        },
        end() {
        }
    },
    'report_l1': {
        another: ['report_l1'],
        points: 10,
        async conditions(req, res, next) {
            const user = req.user;
            const reports = await db('comments').distinct('toPlayerId').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .first().then(r => r.num);
            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return reports >= 10;
        },
        end() {
        }
    },
    'report_l2': {
        another: ['report_l2'],
        points: 20,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .first().then(r => r.num);

            const hammerReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, type: 'report', status: 1})
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 100 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l1'];
        },
        end() {
        }
    },
    'report_l3': {
        another: ['report_l3'],
        points: 30,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .first().then(r => r.num);

            const hammerReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, type: 'report', status: 1})
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 300 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l2'];
        },
        end() {
        }
    },
    'report_l4': {
        another: ['report_l4'],
        points: 50,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .first().then(r => r.num);

            const hammerReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, type: 'report', status: 1})
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 1000 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l3'];
        },
        end() {
        }
    },
    'report_l5': {
        another: ['report_l5'],
        points: 70,
        async conditions(req, res, next) {
            const user = req.user;
            const totalReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .where({'comments.byUserId': user.id, type: 'report'})
                .first().then(r => r.num);

            const hammerReports = await db('comments').distinct('toPlayerId').count({num: 1})
                .join('players')
                .select('players.status', 'comments.byUserId', 'comments.type')
                .where({'comments.byUserId': user.id, type: 'report', status: 1})
                .first().then(r => r.num);

            if (req.user.privilege && req.user.privilege.indexOf('bot') >= 0) return false;
            return totalReports >= 5000 && hammerReports / totalReports >= 0.96 && req.user.attr.achievements['report_l4'];
        },
        end() {
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
        const user = req.user;

        let update = {attr: {}}
        if (achievementConfig[id] && req.user.attr.achievements[id])
            return res.status(403).json({
                error: 1,
                code: 'achievement.duplicate',
                message: 'this achievement has been added'
            })
        else if (achievementConfig[id] && achievementConfig[id].conditions && await achievementConfig[id].conditions(req, res, next))
            update.attr = {achievements: Object.assign(req.user.attr.achievements, {[id]: new Date().getTime()})}
        else if (achievementConfig[id] && achievementConfig[id].conditions && !await achievementConfig[id].conditions(req, res, next))
            return res.status(403).json({
                error: 1,
                code: 'achievement.notConditions',
                message: 'the acquisition conditions are not met'
            })
        else
            return res.status(403).json({error: 1, code: 'achievement.ineffective', message: 'no such achievement'})

        update.attr = JSON.stringify(userSetAttributes({}, update.attr));

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

        let update = {attr: {}}
        let attr = {};
        attr = {achievements: {...req.user.attr.achievements, [achievementId]: new Date().getDate()}};
        update.attr = JSON.stringify(userSetAttributes(req.user.attr, attr, true));

        await db.from('users').update(update).where({id: req.user.id});
        if (achievementConfig[id].end)
            achievementConfig[id].end(req, res, next);

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

        let update = {attr: {}}
        let attr = {};
        if (achievementConfig[achievementId]) {
            delete req.user.attr.achievements[achievementId];
            attr = {achievements: {...req.user.attr.achievements}};
        } else
            return res.status(403).json({error: 1, code: 'achievement.not', message: 'No such achievement'})

        update.attr = JSON.stringify(userSetAttributes(req.user.attr, attr, true));

        await db.from('users').update(update).where({id: req.user.id});
        if (achievementConfig[id].end)
            achievementConfig[id].end(req, res, next);

        return res.status(200).json({success: 1, code: 'achievement.success'});
    } catch (err) {
        next(err);
    }
});


export default router;
