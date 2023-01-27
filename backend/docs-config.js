"use strict";

const docs_config = {
    openapi: "3.0.3",
    basePath: '/',
    schemes: ['http', 'https'],
    info: {
        title: 'BFBAN V2 DOCS',
        version: '2.0.0',
        description: 'bfban 后端接口文档，任何问题请到github的bfban仓库提出问题',
        license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    servers: [
        { "url": "http://127.0.0.1:3000" },
        { "url": "https://bfban.com" },
        { "url": "https://bfban.gametools.network" },
        { "url": "https://bfban-testing.gametools.network" },
        { "url": "https://api.bfban.com" }
    ],
    tags: [
        {
            name: '统计',
            description: '网站统计'
        },
        {
            name: '玩家',
            description: '玩家一类信息'
        },
        {
            name: '查询',
            description: '玩家一类信息'
        }
    ],
    components: {
        "securitySchemes": {
            "x-access-token": {
                'type': "apiKey",
                'name': "x-access-token",
                'in': "header"
            }
        }
    },
}

export default docs_config;
