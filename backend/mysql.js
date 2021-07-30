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
        typeCast: (field, next)=> {
            if(field.type == 'JSON')
                return JSON.parse(field.string());
            return next();
        }
    }
});

export default db;