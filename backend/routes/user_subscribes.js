import {forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {body as checkbody, query as checkquery} from "express-validator/src/middlewares/validation-chain-builders.js";
import {validationResult} from "express-validator";
import db from "../mysql.js";
import express from "express";

// Maximum tracking quantity
const maxSubscribes = 100;

const router = express.Router();

router.post('/subscribes', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'subscribes.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'subscribes.notFound', message: 'no such user.'});

        const {skip = 0, limit = 10} = req.body;
        const subscribes = user.subscribes || [];
        const total = subscribes.length || 0;
        var result = [];

        result = result.concat(await db.select('*').from('players').whereIn('id', subscribes.slice(skip, limit * (skip == 0 ? 1 : skip)))
            .then(r => r.map(i => {
                delete i.valid;
                return i;
            }))
        );

        return res.status(200).json({success: 1, code: 'subscribes.success', data: result, total});
    } catch (err) {
        next(err);
    }
});

router.post('/isSubscribes', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkbody('id').isInt(),
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'subscribes.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'subscribes.notFound', message: 'no such user.'});

        const {id} = req.body;
        const subscribes = user.subscribes;
        return res.status(200).setHeader('Cache-Control', 'public, max-age=7').json({success: 1, code: 'subscribes.success', data: subscribes.includes(id)});
    } catch (err) {
        next(err);
    }
});

router.post('/subscribes/add', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkbody('playerIds').isArray({min: 1, max: maxSubscribes})
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'subscribes.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'subscribes.notFound', message: 'no such user.'});

        const {playerIds} = req.body;
        const subscribes = user.subscribes;
        var newSubscribes = Array.from(new Set([...subscribes, ...playerIds]));

        if (newSubscribes.length > maxSubscribes)
            return res.status(401).json({error: 1, code: 'subscribes.exceedMax', message: 'Exceed the maximum'});

        await db('users').update({subscribes: JSON.stringify(newSubscribes)}).where({id: req.user.id});
        return res.status(200).json({success: 1, code: 'subscribes.success'});
    } catch (err) {
        next(err);
    }
});

router.post('/subscribes/delete', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkbody('playerIds').isArray({min: 1})
], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'subscribes.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.user.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'subscribes.notFound', message: 'no such user.'});

        const {playerIds} = req.body;
        const subscribes = user.subscribes;

        // delete subscribes
        var newSubscribes = subscribes.filter(item => !playerIds.includes(item));

        if (newSubscribes.length > maxSubscribes)
            return res.status(401).json({error: 1, code: 'subscribes.exceedMax', message: 'Exceed the maximum'});

        await db('users').update({subscribes: JSON.stringify(newSubscribes)}).where({id: req.user.id});
        return res.status(200).json({success: 1, code: 'subscribes.success'});
    } catch (err) {
        next(err);
    }
});

export {
    router,
};
