"use strict";

const docs_config = {
    openapi: "3.0.3",
    basePath: "/",
    schemes: ["http", "https"],
    info: {
        title: "BFBAN backend V2 API document",
        version: "2.0.0",
        description: "bfban back-end interface documentation, any questions please to github\"s bfban repository questions",
        contact: {
            email: "app@bfban.com",
            name: "API Support"
        },
        license: {
            name: "Apache 2.0",
            url: "https://www.apache.org/licenses/LICENSE-2.0.html"
        }
    },
    servers: [
        {
            "url": "http://localhost", "description": "local host",
            "variables": {
                "port": {
                    "enum": [
                        "3000",
                        "3001",
                        "3002"
                    ],
                    "default": "3000"
                },
            }
        },
        {
            "url": "https://bfban.gametools.network", "description": "main hosting service"
        },
    ],
    tags: [],
    components: {
        "securitySchemes": {
            "x-access-token": {
                "type": "apiKey",
                "name": "x-access-token",
                "in": "header"
            },
        }
    },
}

export default docs_config;
