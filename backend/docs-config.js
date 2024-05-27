"use strict";

/**
 *
 */

const docs_config = {
    openapi: "3.0.3",
    basePath: "/",
    schemes: ["http", "https"],
    info: {
        title: "BFBAN backend V2 API document",
        version: ">2.0.0",
        description: "bfban back-end interface documentation, any questions please to github\"s bfban repository questions",
        contact: {
            email: "services@bfban.com",
            name: "API Support"
        },
        license: {
            name: "MIT License",
            url: "https://github.com/BFBAN/bfban-website/blob/master/LICENSE"
        }
    },
    servers: [
        {
            "url": "{protocol}://{environment}.bfban.com",
            "description": "main hosting service",
            "variables": {
                "environment": {
                    "enum": [
                        "api",
                        "api.dev",
                    ],
                    "default": "api"
                },
                "protocol": {
                    "enum": [
                        "http",
                        "https",
                    ],
                    "default": "https"
                },
            }
        },
        {
            "url": "{protocol}://localhost:{port}",
            "description": "local host",
            "variables": {
                "port": {
                    "enum": [
                        "3000",
                        "3001",
                        "3002",
                        "3003",
                        "3004",
                    ],
                    "default": "3000"
                },
                "protocol": {
                    "enum": [
                        "http",
                        "https",
                    ],
                    "default": "http"
                },
            }
        },
    ],
    tags: [],
    components: {
        "securitySchemes": {
            "appToken": {
                "type": "apiKey",
                "name": "x-access-token",
                "description": "This value is an account identity token",
                "in": "header"
            },
            "appId": {
                "type": "apiKey",
                "name": "x-app-id",
                "in": "header"
            }
        },
    },
}

export default docs_config;
