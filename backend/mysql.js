"use strict";
import knex from "knex";
import config from "./config.js";

const db = knex({
    client: 'mysql',
    connection: {
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        charset: 'utf8mb4',
        typeCast: (field, next)=> {
            if(field.type == 'JSON')
                return JSON.parse(field.string());
            else if(field.type == 'BIGINT')
                return parseInt(field.string());    // MAX_INT is around 2^53, be awar of precision lost
            return next();
        }
    },
    pool: { min: 0, max: 10000 }  // 根据应用负载调整这些值
});

export default db;
